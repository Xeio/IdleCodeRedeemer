interface UseServerBuffResponse {
    success:            boolean;
    failure_reason?:    FailureReason;
    okay:               boolean;
    buffs_remaining:    number;
    actions:            BlacksmithAction[];
    processing_time:    string;
    memory_usage:       string;
    apc_stats:          ApcStats;
    db_stats:           { [key: string]: boolean };
}

interface BlacksmithAction {
    action:        string;
    hero_id:       string;
    slot_id:       number;
    amount:        string;
    enchant_level: number;
}