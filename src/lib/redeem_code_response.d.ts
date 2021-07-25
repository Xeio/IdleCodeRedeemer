interface RedeemCodeResponse {
    success:            boolean;
    failure_reason?:    FailureReason;
    error_code?:        number;
    okay?:              boolean;
    actions?:           Action[];
    recovery_options?:  string;
    processing_time:    string;
    memory_usage:       string;
    apc_stats:          ApcStats;
    db_stats:           { [key: string]: boolean };
    loot_details?:      LootDetail[];
}

interface Action {
    action:        string;
    chest_type_id: number;
    count:         number;
}

interface ApcStats {
    gets:      number;
    gets_time: string;
    sets:      number;
    sets_time: string;
}

declare const enum FailureReason {
    OutdatedInstanceId = "Outdated instance id",
    AlreadyRedeemed = "you_already_redeemed_combination",
    /** InvalidParameters is likely due to credential issues */
    InvalidParameters = "Invalid or incomplete parameters",
    NotValidCombo = "not_valid_combination",
    Expired = "offer_has_expired",
}

interface LootDetail {
    loot_item:     string;
    loot_action:   string;
    count:         number;
    chest_type_id: ChestType;
    before:        number;
    after:         number;
}

declare const enum ChestType{
    Gold = 2,
    Electrum = 282,
}
