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
    NotEnoughCurrency = "Not enough currency",
}

interface LootDetail {
    loot_item:          LootType;
    loot_action:        string;
    count?:             number;
    hero_id?:           number;
    chest_type_id?:     ChestType;
    before?:            number;
    after?:             number;
    unlock_hero_skin?:  number;
}

declare const enum ChestType{
    Silver = 1,
    Gold = 2,
    Modron = 230,
    Electrum = 282,
}

declare const enum LootType{
    HeroUnlock = "unlock_hero",
    Chest = "generic_chest",
    Claim = "claim",
}

interface PurchaseChestResponse {
    success: boolean;
    okay: boolean;
    failure_reason?: string;
    currency_remaining: number;
    currency_spent: number;
    chest_count: number;
    actions?: (ActionsEntity)[] | null;
    processing_time: string;
    memory_usage: string;
    apc_stats: ApcStats;
}

interface OpenGenericChestResponse {
    success: boolean;
    failure_reason?: string;
    loot_details?: LootDetailsEntity[];
    chests_remaining: number;
    actions?: (ActionsEntity)[] | null;
    processing_time: string;
    memory_usage: string;
    apc_stats: ApcStats;
}

interface LootDetailsEntity {
    add_gold_amount?: string | null;
    rarity: number | string;
    loot_action: string;
    hero_id?: number | null;
    slot_id?: number | null;
    added?: boolean | null;
    disenchanted?: boolean | null;
    gilded?: boolean | null;
    new?: boolean | null;
    enchant_level?: number | null;
    disenchant_amount?: number | null;
    disenchant_item_id?: string | null;
    add_inventory_buff_id?: number | null;
    add_soft_currency?: number | null;
    before?: number | null;
    after?: number | null;
}

interface ActionsEntity {
    action: string;
    chest_type_id?: ChestType;
    count?: number;
    stat?: string | null;
    value?: number | null;
    game_instance_id?: number | null;
}
  