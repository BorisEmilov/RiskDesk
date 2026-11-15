import type { KycStatus, PlayerAction, PlayerStatus } from "./enums.js";
import { DomainError } from "./error.js";


export interface PlayerState {
    status: PlayerStatus
    kycStatus: KycStatus
    withdrawalsFrozen: boolean
    bonusesBolcked: boolean
}

export class PlayerPolicy {

    static canPlay(p: PlayerState){
        return p.status === 'Active'
    }

    static canWithdraw(p: PlayerState){
        return p.status === 'Active' && p.withdrawalsFrozen === false && p.kycStatus !== 'Requested'
    }

    static canReciveBonus(p: PlayerState){
        return p.status === 'Active' && !p.bonusesBolcked
    }

    static apply(current: PlayerState, action: PlayerAction): PlayerState {
        if(current.status == 'Closed') throw new DomainError('The account is closed: NO actions allowed')

        const next: PlayerState = {
            status: current.status,
            kycStatus: current.kycStatus,
            withdrawalsFrozen: current.withdrawalsFrozen,
            bonusesBolcked: current.bonusesBolcked,
        }

        switch(action){
            case 'FreezeWithdrawals':
                next.withdrawalsFrozen = true
                break
            case 'UnfreezeWithdrawals':
                next.withdrawalsFrozen = false
                break
            case 'BlockBonuses':
                next.bonusesBolcked = true
                break
            case "UnblockBonuses":
                next.bonusesBolcked = false
                break
            case 'RequestKyc':
                next.kycStatus = 'Requested'
                break
            case 'MarkKycVerified':
                next.kycStatus = 'Verified'
                break
            case 'RejectKyc':
                next.kycStatus = 'Rejected'
                break
            case "Suspend":
                if(current.status === 'SelfExcluded') throw new DomainError('Player is self excluded');
                next.status = 'Suspended'
                break
            case 'Reactivate':
                if(current.status !== 'Suspended') throw new DomainError('Only suspended account can be reactivated')
                next.status = 'Active'
                break
            case 'SelfExclude':
                next.status = 'SelfExcluded'
                break
            case 'Close':
                next.status = 'Closed'
                next.withdrawalsFrozen = true;
                break
            default: {
                const unknownAction: never = action
                throw new DomainError(`Unknown Action: ${String(unknownAction)}`)
            }
        }
        return next;
    }
}

