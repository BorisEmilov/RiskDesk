import type { AlertResolution, AlertStatus, Severity } from "./enums.js"
import { DomainError } from "./error.js"

const HOUR = 60*60*1000

export interface StatusChange {
    status: AlertStatus
    resolution: AlertResolution
    closedAt: Date | null
}

export class AlertWorkflow {

    static readonly transitions: Readonly<Record<AlertStatus, readonly AlertStatus[]>> = {
        Open: ['InReview', 'Escalated', 'Closed'],
        InReview: ['Open', 'Escalated', 'Closed'],
        Escalated: ['InReview', 'Closed'],
        Closed: ['Open']
    }

    static slaMs(severity: Severity): number{
        switch(severity){
            case 'Critical':
                return 4 * HOUR
            case 'High':
                return 24 * HOUR
            case 'Medium':
                return 72 * HOUR
            case 'Low':
                return 7 * 24 * HOUR
        }
    }

    static dueAt(severity: Severity, from = new Date()): Date {
        return new Date(from.getTime() + AlertWorkflow.slaMs(severity))
    }

    static isOverdue(alert: {status: AlertStatus; dueAt: Date}, now = new Date()): boolean {
        return alert.status !== 'Closed' && now.getTime() > alert.dueAt.getTime()
    }

    static assertCanAssign(status: AlertStatus){
        if(status === 'Closed') throw new DomainError('Closed alert cna not be assignes')
    }

    static changeStatus(
        current: AlertStatus,
        next: AlertStatus,
        resolution: AlertResolution,
        now = new Date()
    ): StatusChange {
        if(!AlertWorkflow.transitions[current].includes(next)){
            throw new DomainError(`Invalid status ${next}`)
        }
        if(next === 'Closed' && resolution === 'None'){
            throw new DomainError('Please indicate a resolution')
        }

        const closing = next === 'Closed'

        return {
            status: next,
            resolution: closing ? resolution : 'None',
            closedAt: closing ? now : null
        }
    }
}