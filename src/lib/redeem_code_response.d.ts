interface RedeemCodeResponse {
    success:          boolean;
    failure_reason:   FailureReason;
    error_code:       number;
    recovery_options: string;
    processing_time:  string;
    memory_usage:     string;
    apc_stats:        ApcStats;
    db_stats:         { [key: string]: boolean };
}

interface ApcStats {
    gets:      number;
    gets_time: string;
    sets:      number;
    sets_time: string;
}

declare const enum FailureReason {
    OutdatedInstanceId = "Outdated instance id",
    AlreadyRedeemed = "you_already_redeemed_combination"
}