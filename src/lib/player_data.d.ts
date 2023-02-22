interface PlayerData {
    success:                  boolean;
    details:                  PlayerDataDetails;
    current_time:             number;
    last_event_chest_type_id: number;
    linked_accounts:          any[];
    current_sales:            any[];
    defines:                  PlayerDataDefines;
    debug_hero_health:        boolean;
    debug_blocked_slots:      boolean;
    actions:                  Action[];
    processing_time:          string;
    memory_usage:             string;
    apc_stats:                ApcStats;
    db_stats:                 { [key: string]: boolean };
    switch_play_server:       string;
}

interface Action {
    action:         string;
    event_id:       string;
    event_instance: string;
    added:          number;
    amount:         number;
}

interface ApcStats {
    gets:      number;
    gets_time: string;
    sets:      number;
    sets_time: string;
}

interface PlayerDataDefines {
    adventure_defines:      PurpleAdventureDefine[];
    adventure_area_defines: AdventureAreaDefine[];
    background_defines:     BackgroundDefine[];
    campaign_defines:       CampaignDefine[];
    location_defines:       LocationDefine[];
    monster_defines:        MonsterDefine[];
    quest_defines:          QuestDefine[];
    cinematics_defines:     CinematicsDefine[];
    distraction_defines:    DistractionDefine[];
    reset_currency_defines: ResetCurrencyDefine[];
    reset_tier_defines:     ResetTierDefine[];
    reset_upgrade_defines:  ResetUpgradeDefine[];
    challenge_set_defines:  ChallengeSetDefine[];
}

interface AdventureAreaDefine {
    id:             number;
    area_set_id:    number;
    area_id:        number;
    background_id:  number;
    quest_id:       number;
    properties?:    AdventureAreaDefineProperties;
    monsters?:      number[];
    cinematics_id?: number;
    waves?:         Array<number[]>;
}

interface AdventureAreaDefineProperties {
    level_specific_properties?: { [key: string]: LevelSpecificProperty };
    doodad_info?:               DoodadInfo;
    monster_spawners?:          MonsterSpawners;
    monster_generators?:        MonsterGenerators;
    static_monsters?:           StaticMonsters;
}

interface DoodadInfo {
    StrangeOrb?: Portal;
    Shield?:     Portal;
    Ward?:       Portal;
    Portal?:     Portal;
}

interface Portal {
    graphic_id: number;
    x:          number;
    y:          number;
}

interface LevelSpecificProperty {
    max_spawns:  number;
    spawn_time?: number;
}

interface MonsterGenerators {
    standard: Standard;
}

interface Standard {
    spawners: SpawnerElement[];
}

declare enum SpawnerElement {
    ORBSpawner = "OrbSpawner",
    PortalSpawner = "PortalSpawner",
    WardSpawner = "WardSpawner",
}

interface MonsterSpawners {
    OrbSpawner?:    ORBSpawner;
    WardSpawner?:   Spawner;
    PortalSpawner?: Spawner;
}

interface ORBSpawner {
    type:            ORBSpawnerType;
    doodad?:         string;
    static_monster?: string;
}

declare enum ORBSpawnerType {
    Magic = "magic",
}

interface Spawner {
    type:   ORBSpawnerType;
    doodad: Doodad;
}

declare enum Doodad {
    Portal = "Portal",
    Ward = "Ward",
}

interface StaticMonsters {
    StrangeOrb: StrangeORB;
}

interface StrangeORB {
    monster_id: number;
    x:          number;
    y:          number;
}

interface PurpleAdventureDefine {
    id:                     number;
    campaign_id:            number;
    location_id:            number;
    area_set_id:            number;
    repeatable:             boolean;
    name:                   string;
    description:            string;
    graphic_id:             number;
    requirements_text:      string;
    objectives_text:        string;
    restrictions_text:      string;
    requirements:           PurpleRequirement[];
    objectives:             Objective[];
    game_changes:           AdventureDefineGameChange[];
    rewards:                PurpleReward[];
    repeat_rewards:         RepeatReward[];
    costs:                  CostElement[];
    patron_objectives:      any[] | { [key: string]: PatronObjectiveValue };
    patron_rewards:         any[] | { [key: string]: PatronObjectiveValue };
    allow_offline_progress: string;
    variant_adventure_id?:  number;
}

interface CostElement {
    cost:     CostEnum;
    event_id: number;
    amount:   number;
}

declare enum CostEnum {
    EventTokens = "event_tokens",
}

interface AdventureDefineGameChange {
    type:                      string;
    effects?:                  Array<EffectEffect | string>;
    slot_id?:                  number;
    hp?:                       number;
    graphic?:                  number;
    monster_id?:               number;
    after_num_spawned?:        number | string;
    properties?:               GameChangeProperties;
    from_name_override?:       string;
    portrait_overlay?:         boolean;
    owned_by_hero?:            boolean;
    name?:                     string;
    formation?:                Formation[];
    id?:                       number;
    escorts?:                  Escort[];
    by_attack_types?:          ByAttackTypes;
    initial?:                  number[];
    hero_ids?:                 number[];
    start_levels?:             number[];
    forced_slots?:             ForcedSlot[];
    by_tags?:                  ByTags;
    by_stat?:                  ByStat;
    chance?:                   number;
    blocks_spawns?:            boolean;
    monster_ids?:              number[];
    by_id?:                    { [key: string]: ByID };
    slot_effects?:             SlotEffect[];
    range?:                    string;
    replace_wave?:             boolean;
    wave_delay?:               number;
    monster_properties_by_id?: { [key: string]: MonsterPropertiesByID };
    buff_key?:                 string;
    desc2?:                    string;
    graphic_id?:               number;
    affects_bosses?:           boolean;
    replaces_regular_monster?: boolean;
    count?:                    number;
    affects_boss_levels?:      boolean;
    uniquely_random?:          boolean;
    after_waves_spawned?:      number;
    spawn_rules?:              SpawnRule[];
    from_monster_ids?:         number[];
    to_monster_tag?:           string;
    effects_on_death?:         EffectsOnDeath[];
    effects_on_hit?:           EffectsOnHitElement[];
}

interface ByAttackTypes {
    attack_types:     string[];
    blocked_portrait: number;
}

interface ByID {
    monster_effects?:  Array<MonsterEffectClass | string>;
    only_damage_from?: OnlyDamageFrom;
}

interface MonsterEffectClass {
    effect_string: string;
    targets:       string[];
}

interface OnlyDamageFrom {
    hero_ids: number[];
}

interface ByStat {
    stats:            ByStatStat[];
    blocked_portrait: number;
    pass_any?:        boolean;
}

interface ByStatStat {
    stat:  string;
    comp:  string;
    value: number;
}

interface ByTags {
    tags:             string;
    blocked_portrait: number;
}

interface EffectEffect {
    heroes_by_effect?: HeroesByEffect[];
    effect_string?:    string;
    buff_box?:         UpgradesToDisplay;
}

interface UpgradesToDisplay {
    graphic_id:  number;
    key?:        string;
    name:        string;
    description: string;
}

interface HeroesByEffect {
    effect_id: number;
    heroes:    number[];
}

interface EffectsOnDeath {
    effect_string:                string;
    use_effect_target_monster_id: boolean;
    chance:                       number;
    ignore_bosses:                boolean;
}

interface EffectsOnHitElement {
    effect_string: string;
}

interface Escort {
    min_area:       number;
    slot_ids:       number[];
    hps:            number[];
    graphics:       number[];
    names:          string[];
    sequence_infos: SequenceInfo[];
}

interface SequenceInfo {
    koed:   number;
    gethit: number;
}

interface ForcedSlot {
    min_area: number;
    slots:    number[];
}

interface Formation {
    x:   number;
    y:   number;
    col: number;
    adj: number[];
}

interface MonsterPropertiesByID {
    monster_effects:             MonsterEffectClass[];
    armor_based_damage?:         boolean;
    override_health_multiplier?: number;
}

interface GameChangeProperties {
    insta_wipe_after_attack?: boolean;
    monster_effects?:         string[];
}

interface SlotEffect {
    slots:        number[];
    effect_index: number;
}

interface SpawnRule {
    type:           string;
    has_hero:       number;
    override_count: number;
}

interface Objective {
    condition: ObjectiveCondition;
    area:      number;
}

declare enum ObjectiveCondition {
    CompleteArea = "complete_area",
}

interface PatronObjectiveValue {
    "1": The1[];
}

interface The1 {
    reward:             The1_Reward;
    patron_id:          number;
    amount:             number;
    dynamic:            boolean;
    formula:            string;
    cap_remaining:      number;
    counts_towards_cap: boolean;
}

declare enum The1_Reward {
    PatronCurrency = "patron_currency",
}

interface RepeatReward {
    reward:             RepeatRewardReward;
    chest_type_ids:     number[];
    chest_odds:         number[];
    pity_timer:         Array<number | string>;
    preview_graphic_id: number;
}

declare enum RepeatRewardReward {
    Chest = "chest",
    ClaimCrusader = "claim_crusader",
    RedRubies = "red_rubies",
}

interface PurpleRequirement {
    condition:     PurpleCondition;
    adventure_id?: number;
    date?:         Date;
    event_id?:     number;
    year?:         number;
    hero_id?:      number;
}

declare enum PurpleCondition {
    AdventureComplete = "adventure_complete",
    Date = "date",
    EventYearUnlocked = "event_year_unlocked",
    HeroAvailable = "hero_available",
}

interface PurpleReward {
    reward:              RepeatRewardReward;
    amount?:             number;
    crusader_id?:        number;
    chest_type_id?:      number;
    chest_type_ids?:     number[];
    chest_odds?:         number[];
    pity_timer?:         Array<number | string>;
    preview_graphic_id?: number;
}

interface BackgroundDefine {
    id:              number;
    near_graphic_id: number;
    mid_graphic_id:  number;
    far_graphic_id:  number;
    fore_graphic_id: number;
    distractions:    Distraction[];
    properties:      any[] | PurpleProperties;
}

interface Distraction {
    distraction_id: number;
    x?:             number;
    y?:             number;
}

interface PurpleProperties {
    is_fixed?:  boolean;
    area_tags?: string[];
}

interface CampaignDefine {
    id:                number;
    name:              string;
    short_name:        string;
    description:       string;
    icon_graphic_id:   number;
    reset_currency_id: number;
    game_changes:      CampaignDefineGameChange[];
    requirements:      CampaignDefineRequirement[];
    properties:        CampaignDefineProperties;
}

interface CampaignDefineGameChange {
    type:                      string;
    name?:                     string;
    formation?:                Formation[];
    initial?:                  Array<number | string>;
    health_growth_rate?:       number;
    health_growth_rate_curve?: HealthGrowthRateCurve;
}

interface HealthGrowthRateCurve {
    "1": number;
}

interface CampaignDefineProperties {
    gamepad_map_graphic_id: number;
    is_event?:              boolean;
}

interface CampaignDefineRequirement {
    condition: string;
    event_id:  number;
}

interface ChallengeSetDefine {
    id:            number;
    name:          string;
    start_seconds: number;
    end_seconds:   number;
    details:       ChallengeSetDefineDetails;
}

interface ChallengeSetDefineDetails {
    required_client_version:        RequiredClientVersion;
    notification_background?:       number;
    console_notification?:          number;
    description_portrait?:          number;
    description_portrait_scale?:    number;
    faq_key?:                       string;
    header_icon?:                   number;
    challenge_set_description?:     string;
    streams?:                       Stream[];
    weeks:                          Week[];
    votes?:                         Vote[];
    challenges:                     Challenge[];
    rewards?:                       DetailsReward[];
    patron_id?:                     number;
    patron_challenges?:             boolean;
    random_challenges?:             boolean;
    random_challenge_count?:        number;
    random_challenge_initial_date?: Date;
    random_challenge_set_duration?: string;
    challenge_points_redirect?:     string;
    random_challenge_ids?:          number[];
    point_graphic_id?:              number;
    point_text_override?:           string;
    stream_id?:                     number;
}

interface Challenge {
    challenge_id:              number;
    week_id:                   number;
    description:               string;
    type:                      ChallengeType;
    ref_stat?:                 string;
    user_stat:                 string;
    goal:                      number;
    points:                    number;
    is_daily?:                 boolean;
    difficulty?:               number;
    unlocks_vote_id?:          number;
    vote_description_pretext?: VoteDescriptionPretext;
    set?:                      boolean;
    reset_trigger?:            ResetTrigger;
    server_trigger?:           ServerTrigger;
    start_trigger?:            StartTrigger;
    ref_stats?:                string[];
    stat_goals?:               number[];
    zref_stat?:                string;
    require_unique_values?:    boolean;
    random?:                   boolean;
    set_id?:                   number;
    bonus_points?:             number;
    requirements?:             ChallengeRequirement[];
    alt_challenge_id?:         number;
}

interface ChallengeRequirement {
    condition: FluffyCondition;
    hero_id:   number;
}

declare enum FluffyCondition {
    HaveHero = "have_hero",
}

interface ResetTrigger {
    type:          ResetTriggerType;
    champion_ids?: number[];
    area:          number;
    champion_tag?: string;
}

declare enum ResetTriggerType {
    HighestDamage = "highest_damage",
}

interface ServerTrigger {
    type:          string;
    currency_id?:  number;
    bigger_only?:  boolean;
    campaign_ids?: number[];
    campaign_id?:  number;
    variants?:     boolean;
    patron_id?:    number;
}

interface StartTrigger {
    type:      string;
    event_id:  number;
    increment: boolean;
}

declare enum ChallengeType {
    Stat = "stat",
}

declare enum VoteDescriptionPretext {
    OminSChallenge = "Omin's Challenge",
}

interface RequiredClientVersion {
    default: number;
}

interface DetailsReward {
    reward_id: number;
    points:    number;
    code:      string;
    effect:    RewardEffect[];
}

interface RewardEffect {
    type:           EffectType;
    buff_id?:       number;
    count?:         number;
    chest_type_id?: number;
    skin_id?:       number;
    loot_id?:       number;
    gild_level?:    number;
    message?:       string;
    hero_id?:       number;
}

declare enum EffectType {
    AwardBuff = "award_buff",
    GenericChest = "generic_chest",
    Loot = "loot",
    Skin = "skin",
    UnlockChampion = "unlock_champion",
}

interface Stream {
    pre_stream_description: string;
    stream_description:     string;
    stream_url:             string;
    archive_url:            string;
    button_active:          ButtonActive;
    button_inactive:        ButtonInactive;
    start_seconds:          number;
    end_seconds:            number;
}

declare enum ButtonActive {
    WatchNow = "Watch Now!",
}

declare enum ButtonInactive {
    ViewArchives = "View Archives",
}

interface Vote {
    vote_id:               number;
    challenge_id:          number;
    pre_vote_description:  PreVoteDescription;
    vote_description:      string;
    options:               string[];
    post_vote_description: string;
    start_seconds:         number;
    end_seconds:           number;
}

declare enum PreVoteDescription {
    CompleteOminSChallengeToVoteInTheWeeklyPoll = "Complete Omin's Challenge to vote in the weekly poll",
}

interface Week {
    week_id:       number;
    start_seconds: number;
    end_seconds:   number;
}

interface CinematicsDefine {
    id:      number;
    details: Detail[];
}

interface Detail {
    type:     DetailType;
    sequence: Sequence[];
}

interface Sequence {
    type:        SequenceType;
    text?:       string;
    hero_id?:    number;
    name?:       string;
    graphic_id?: number;
}

declare enum SequenceType {
    Hero = "hero",
    Npc = "npc",
    ShowQuest = "show_quest",
}

declare enum DetailType {
    End = "end",
    Start = "start",
}

interface DistractionDefine {
    distraction_id: number;
    name:           string;
    graphic_id:     number;
    type:           number;
    rewards:        DistractionDefineReward[];
    properties:     DistractionDefineProperties;
}

interface DistractionDefineProperties {
    min_speed?:          number;
    max_speed?:          number;
    min_spawn_time?:     number;
    max_spawn_time?:     number;
    path?:               number;
    clickable_time?:     number;
    deactive_to_active?: number;
    chance_of_spawning?: number;
    goober_offset_y?:    number;
    stop_time?:          number;
}

interface DistractionDefineReward {
    reward:       string;
    odds:         number;
    min:          number;
    max:          number;
    max_goobers?: number;
    min_goobers?: number;
}

interface LocationDefine {
    id:                number;
    map_id:            number;
    name:              string;
    map_location_name: string;
    properties:        LocationDefineProperties;
}

interface LocationDefineProperties {
    description: string;
}

interface MonsterDefine {
    id:               number;
    name:             string;
    graphic_id:       number;
    type:             number;
    tags:             string[];
    attack_id:        number;
    sounds?:          Sounds;
    scale?:           number;
    health_modifier?: number;
    damage_modifier?: number;
    speed_modifier?:  number;
    properties?:      MonsterDefineProperties;
}

interface MonsterDefineProperties {
    hits_based_damage?: boolean;
    shoot_frame?:       number;
    projectile_x?:      number;
    projectile_y?:      number;
    sequences?:         Sequences;
}

interface Sequences {
    shoot: number;
}

interface Sounds {
    death: number;
}

interface QuestDefine {
    id:               number;
    description:      string;
    type:             number;
    goal_amount:      number;
    goal_description: string;
    goal_graphic_id:  number;
    properties:       any[];
}

interface ResetCurrencyDefine {
    id:          number;
    name:        string;
    short_name:  string;
    description: string;
    graphic_id:  number;
    effects:     EffectsOnHitElement[];
    properties:  ResetCurrencyDefineProperties;
}

interface ResetCurrencyDefineProperties {
    can_reset?:          boolean;
    can_convert_to?:     boolean;
    outlined_icon:       number;
    box_icon:            number;
    campaign_name:       string;
    mini_graphic_id?:    number;
    can_convert?:        boolean;
    convert_start_date?: Date;
    convert_end_date?:   Date;
    time_gate_currency?: boolean;
    convert_ratio?:      number;
}

interface ResetTierDefine {
    id:                number;
    reset_currency_id: number;
    tier_id:           number;
    requirements:      ResetTierDefineRequirement[];
}

interface ResetTierDefineRequirement {
    type:              RequirementType;
    reset_currency_id: number;
    amount:            number;
}

declare enum RequirementType {
    ResetUpgradesPurchased = "reset_upgrades_purchased",
}

interface ResetUpgradeDefine {
    id:                number;
    reset_currency_id: number;
    name:              string;
    type:              number;
    tier_id:           number;
    cost:              ResetUpgradeDefineCost;
    levels:            number;
    effects:           ResetUpgradeDefineEffect[];
    graphic_id:        number;
    properties:        any[] | FluffyProperties;
}

interface ResetUpgradeDefineCost {
    base_cost: number;
    scaling:   number;
}

interface ResetUpgradeDefineEffect {
    effect_string:   string;
    per_level?:      number;
    value_suffix?:   string;
    value_prefix?:   string;
    targets?:        string[];
    target_name?:    string;
    override_desc?:  string;
    affects_bosses?: boolean;
}

interface FluffyProperties {
    remove_global_text?:      boolean;
    required_client_version?: number;
}

interface PlayerDataDetails {
    formation:                      number[];
    current_area:                   number;
    highest_area:                   number;
    gold:                           string;
    heroes:                         Hero[];
    loot:                           DetailsLoot[];
    achievements:                   any[];
    abilities:                      any[];
    buffs:                          DetailsBuff[];
    tiles:                          Tile[];
    stats:                          { [key: string]: number | string };
    base_click_damage:              number;
    click_level:                    number;
    seconds_since_last_save:        number;
    is_new_game:                    number;
    seconds_played:                 number;
    seconds_since_reset:            number;
    current_adventure_id:           number;
    current_patron_id:              number;
    current_patron_tier:            number;
    patrons:                        Patron[];
    patron_perks:                   PatronPerk[];
    red_rubies:                     number;
    red_rubies_spent:               number;
    formation_saves:                any[];
    familiar_saves:                 any[];
    options:                        Options;
    external_achievements:          any[];
    complete_tutorial_states:       string[];
    adventure_specific_data:        any[];
    unlocked_hero_skins:            number[];
    unlocked_familiar_skins:        number[];
    assigned_familiar_skins:        AssignedFamiliarSkin[];
    attack_cooldowns:               AttackCooldown[];
    familiars:                      Familiar[];
    clickskins:                     Clickskin[];
    reset_currencies:               ResetCurrency[];
    music_player:                   MusicPlayer;
    trials_data:                    TrialsData;
    credited_dlc_packages:          any[];
    num_unfinished_transactions:    number;
    last_changelog_seen:            string;
    last_news_seen:                 string;
    instance_id:                    string;
    newsletter_link_code:           string;
    signed_up_for_newsletter:       boolean;
    newsletter_email:               string;
    chests:                         { [key: string]: number };
    chest_packs:                    ChestPack[];
    last_buff_saved:                number;
    show_tos:                       boolean;
    offline_progress:               OfflineProgress;
    promotions:                     Promotion[];
    package_deals:                  PackageDeal[];
    active_referrals:               ActiveReferrals;
    adventure_data:                 AdventureData;
    formation_saves_v2_campaign_id: string;
    formation_saves_v2:             FormationSavesV2[];
    formation_saves_v2_max:         number;
    reset_upgrade_levels:           { [key: string]: string };
    event_details:                  EventDetail[];
    modron_saves:                   { [key: string]: ModronSave };
    modron_components:              string;
    modron_purchases_enabled:       boolean;
    unlock_instance_campaign:       number;
    challenge_sets:                 ChallengeSet[];
    time_gates:                     TimeGates;
    time_gates_enabled:             boolean;
    flash_sales:                    any[];
    new_shop_enabled:               boolean;
    tanking_and_healing:            number;
    march_13_qol:                   number;
    new_dps_display:                number;
    y1_rebalance:                   number;
    y1_rebalance_p2:                number;
    show_jukebox:                   number;
    new_code_redemption:            number;
    patron_system_enabled:          number;
    show_big_picture_toggle:        number;
    custom_notifications:           any[];
    ab_tests:                       AbTest[];
    multi_instance:                 number;
    multi_instance_backend:         number;
    game_instances:                 GameInstance[];
    active_game_instance_id:        string;
    show_twitch_ui:                 number;
    twitch_account_details:         TwitchAccountDetails;
}

interface AbTest {
    test:    string;
    group:   string;
    details: any[];
}

interface ActiveReferrals {
    defines:       any[];
    referral_data: any[];
    names:         any[];
}

interface AdventureData {
    reset_currency:       string;
    gold_growth_rate:     number;
    currency_growth_rate: number;
    first_currency:       number;
    completed:            boolean;
    previously_completed: boolean;
    reset_upgrade_levels: { [key: string]: string };
}

interface AssignedFamiliarSkin {
    user_id:          string;
    familiar_skin_id: string;
    active:           string;
    unlock_date:      Date;
}

interface AttackCooldown {
    attack_id:          number;
    cooldown_remaining: number;
}

interface DetailsBuff {
    user_id:          string;
    buff_id:          string;
    remaining_time:   number;
    total_duration:   number;
    inventory_amount: string;
    current_stacks:   number;
}

interface ChallengeSet {
    challenge_set_id:         string;
    user_data:                any[] | UserDataUserData;
    completed_challenges:     number[];
    claimed_rewards:          any[];
    votes:                    any[] | VotesClass;
    daily_quests:             any[];
    points:                   number;
    next_daily_quest_seconds: number;
    current_day:              number;
    current_week:             number;
}

interface UserDataUserData {
    random_set_number:             number;
    random_challenges:             number[];
    last_week_random_challenges:   number[];
    last_week_random_challenges_2: number[];
    stats:                         Stats;
}

interface Stats {
    EarnCurrencyMediumS92?:        number;
    EarnCurrencyHardS92?:          number;
    UseUltimatesEasyS92?:          string;
    Champions3EasyS92?:            string;
    NoTankingEasyS92?:             string;
    FreePlaysCompletedMediumS92?:  string;
    FreePlayAreaMediumS92?:        string;
    DefeatUndeadMediumS92?:        string;
    HighestDamage1S92?:            string;
    DefeatFeyHardS92?:             string;
    DestroyDistractionsHardS92?:   string;
    EarnCurrencyHardS93?:          number;
    DefeatBossesEasyS93?:          string;
    DestroyDistractionsEasyS93?:   string;
    CollectGemsEasyS93?:           string;
    DefeatConstructsMediumS93?:    string;
    UseUltimatesMediumS93?:        string;
    Champions1MediumS93?:          string;
    NoTankingMediumS93?:           string;
    FreePlaysCompletedHardS93?:    string;
    DefeatHumanoidsHardS93?:       string;
    OpenPatronChestS93?:           string;
    EarnCurrencyHardS94?:          number | string;
    DefeatBeastsEasyS94?:          string;
    DestroyDistractionsEasyS94?:   string;
    Champions2EasyS94?:            string;
    DefeatUndeadMediumS94?:        string;
    DefeatFeyMediumS94?:           string;
    HighestDamage2S94?:            string;
    HighestDamageHealingS94?:      string;
    DefeatBossesHardS94?:          string;
    CollectGemsHardS94?:           string;
    ChallengesNotificationWeek1:   string;
    EarnCurrencyEasyS92?:          number;
    DefeatBossesEasyS92?:          string;
    DestroyDistractionsEasyS92?:   string;
    UseUltimatesMediumS92?:        string;
    CollectGemsMediumS92?:         string;
    HighestDamage7S92?:            string;
    DefeatConstructsHardS92?:      string;
    Champions1HardS92?:            string;
    NoSupportHardS92?:             string;
    EarnCurrencyEasyS93?:          number;
    DefeatBeastsEasyS93?:          string;
    DefeatUndeadEasyS93?:          string;
    UseUltimatesEasyS93?:          string;
    DefeatBossesMediumS93?:        string;
    NoSupportMediumS93?:           string;
    HighestDamage1S93?:            string;
    CollectGemsHardS93?:           string;
    Champions1HardS93?:            string;
    UseUltimatesEasyS94?:          string;
    NoDPSEasyS94?:                 string;
    Champions4EasyS94?:            string;
    FreePlaysCompletedMediumS94?:  string;
    DefeatHumanoidsMediumS94?:     string;
    DefeatBossesMediumS94?:        string;
    HighestDamage4S94?:            string;
    DefeatFeyHardS94?:             string;
    OpenPatronChestS94?:           string;
    CollectGemsEasyS92?:           string;
    DefeatFiendsMediumS92?:        string;
    NoHealingMediumS92?:           string;
    Champions2MediumS92?:          string;
    HighestDamage2S92?:            string;
    FreePlaysCompletedHardS92?:    string;
    FreePlayAreaHardS92?:          string;
    DefeatBeastsHardS92?:          string;
    EarnCurrencyMediumS93?:        number;
    DefeatFeyEasyS93?:             string;
    CollectGemsMediumS93?:         string;
    NoHealingMediumS93?:           string;
    Champions2HardS93?:            string;
    PurchaseShopItemS93?:          string;
    EarnCurrencyMediumS94?:        number;
    DefeatUndeadEasyS94?:          string;
    DefeatConstructsEasyS94?:      string;
    DestroyDistractionsMediumS94?: string;
    Champions1MediumS94?:          string;
    FreePlaysCompletedHardS94?:    string;
    UseUltimatesHardS94?:          string;
    FreePlayAreaEasyS92?:          string;
    DefeatBeastsEasyS92?:          string;
    HighestDamage4S92?:            string;
    HighestDamageTankingS92?:      string;
    DefeatHumanoidsHardS92?:       string;
    UseUltimatesHardS92?:          string;
    Champions2HardS92?:            string;
    FreePlayAreaEasyS93?:          string;
    NoSupportEasyS93?:             string;
    DefeatBeastsMediumS93?:        string;
    DestroyDistractionsMediumS93?: string;
    Champions2MediumS93?:          string;
    HighestDamage2S93?:            string;
    DefeatFiendsHardS93?:          string;
    ReachCurrencyCapS93?:          string;
    FreePlayAreaEasyS94?:          string;
    Champions3MediumS94?:          string;
    HighestDamage8S94?:            string;
    DefeatFiendsHardS94?:          string;
    NoTankingHardS94?:             string;
}

interface VotesClass {
    "-1": number;
}

interface ChestPack {
    pack_id:         number;
    chest_type_id:   number;
    total_chests:    number;
    opened_chests:   number;
    guaranteed_loot: GuaranteedLoot;
}

interface GuaranteedLoot {
    shiny: boolean[];
}

interface Clickskin {
    user_id:       string;
    click_skin_id: string;
    active:        number;
    unlock_date:   Date;
}

interface EventDetail {
    event_id:                number;
    event_instance:          number;
    active:                  boolean;
    end_purchases_in:        number;
    name:                    string;
    analytics_name:          string;
    description:             string;
    details:                 EventDetailDetails;
    ends_in:                 number;
    user_data:               EventDetailUserData;
    total_duration:          number;
    next_year_unlock_cost:   NextYearUnlockCost[];
    completed_adventure_ids: number[];
    reset_currency:          number;
}

interface EventDetailDetails {
    required_client_version: RequiredClientVersion;
    exclude_network_ids:     any[];
    event_token:             EventToken;
    notification_background: number;
    notification_type:       string;
    title_graphic:           number;
    campaign_id:             number;
    freeplay_cost_desc:      string;
    tab_glow_graphic:        number;
    summary_tab_graphic:     number;
    console_tab_graphic:     number;
    initialize_actions:      InitializeAction[];
    years:                   Year[];
}

interface EventToken {
    name:            string;
    name_plural:     string;
    win_every:       number;
    win_range:       number;
    graphic_id:      number;
    mini_graphic_id: number;
}

interface InitializeAction {
    action:        string;
    adventure_id?: number;
    requirements?: ChallengeRequirement[];
    year?:         number;
}

interface Year {
    premium_chest_type_id:      number;
    payers_get_at_end:          PayersGetAtEnd[];
    shop_desc:                  string;
    tab_graphics:               number[];
    chest_ids:                  number[];
    hero_ids:                   number[];
    hero_achievement_ids:       number[];
    adventure_ids:              number[];
    achievement_ids:            number[];
    equipment_to_display:       number[];
    specializations_to_display: number[];
    upgrades_to_display:        UpgradesToDisplay[];
}

interface PayersGetAtEnd {
    reward:      RepeatRewardReward;
    crusader_id: number;
}

interface NextYearUnlockCost {
    cost:   string;
    amount: number;
}

interface EventDetailUserData {
    event_tokens:     number;
    last_token_time:  number;
    unlocked_years:   number[];
    warp_time:        number;
    total_token_time: number;
    total_warp_time:  number;
}

interface Familiar {
    user_id:     string;
    familiar_id: string;
    assignment:  Assignment;
}

interface Assignment {
    Seat?:             number;
    game_instance_id:  number;
    Clicks?:           number;
    UltimateSpecific?: number;
}

interface FormationSavesV2 {
    formation_save_id: number;
    campaign_id:       number;
    name:              string;
    favorite:          number;
    formation:         number[];
    familiars:         Familiars;
    specializations:   any[] | { [key: string]: number[] };
}

interface Familiars {
    Ultimates:        number[];
    Clicks:           number[];
    Seat:             number[];
    UltimateSpecific: number[];
}

interface GameInstance {
    formation:                       number[];
    current_area:                    number;
    highest_area:                    number;
    gold:                            string;
    base_click_damage:               number;
    click_level:                     number;
    seconds_since_last_save:         number;
    seconds_since_reset:             number;
    current_adventure_id:            number;
    current_patron_id:               number;
    current_patron_tier:             number;
    adventure_specific_data:         any[] | string;
    hero_in_seats:                   { [key: string]: number };
    buffs:                           GameInstanceBuff[];
    stats:                           { [key: string]: number | string };
    offline_progress:                OfflineProgress;
    defines:                         any[] | DefinesDefines;
    adventure_data?:                 AdventureData;
    formation_saves_v2?:             FormationSavesV2[];
    formation_saves_v2_campaign_id?: string;
    formation_saves_v2_max?:         number;
    game_instance_id:                number;
    do_multi_reset:                  boolean;
    do_multi_finish:                 boolean;
    custom_name:                     string;
    auto_reset_stats:                AutoResetStats;
    auto_reset_gains:                any[];
}

interface AutoResetStats {
    resets_since_last_manual: number;
}

interface GameInstanceBuff {
    buff_id:        number;
    remaining_time: number;
    total_duration: number;
    current_stacks: number;
}

interface DefinesDefines {
    adventure_defines: FluffyAdventureDefine[];
}

interface FluffyAdventureDefine {
    id:                     number;
    campaign_id:            number;
    location_id:            number;
    area_set_id:            number;
    repeatable:             boolean;
    name:                   string;
    description:            string;
    graphic_id:             number;
    requirements_text:      string;
    objectives_text:        string;
    restrictions_text:      string;
    requirements:           FluffyRequirement[];
    objectives:             Objective[];
    game_changes:           any[];
    rewards:                FluffyReward[];
    repeat_rewards:         any[];
    costs:                  any[];
    patron_objectives:      any[] | { [key: string]: PatronObjectiveValue };
    patron_rewards:         any[] | { [key: string]: PatronObjectiveValue };
    allow_offline_progress: string;
    variant_adventure_id?:  number;
}

interface FluffyRequirement {
    condition:    PurpleCondition;
    adventure_id: number;
}

interface FluffyReward {
    reward: RepeatRewardReward;
    amount: number;
}

interface OfflineProgress {
    gold_before:           string;
    gold_earned_offline:   string;
    gold_rate:             string;
    offline_time:          number;
    start_area:            number;
    end_area:              number;
    areas_completed:       number;
    tokens_earned_offline: number;
    debug_notes:           string[];
    resets:                any[];
    multi_time_left:       number;
    needs_soft_reset:      boolean;
    resets_done_offline:   number;
    gold_after:            string;
    boss_loot:             BossLoot[];
    seen?:                 number;
    time_since_recorded:   number;
}

interface BossLoot {
    add_soft_currency: number;
    before:            string;
    after:             number;
}

interface Hero {
    user_id:                string;
    hero_id:                string;
    level:                  string;
    upgrades:               number[];
    health:                 string;
    grind_time:             string;
    owned:                  string;
    in_seat:                string;
    feat_slots:             number;
    game_instance_id:       string;
    specialization_choices: number[];
    skin_id:                number;
    unlocked_feats:         number[];
    active_feats:           number[];
    feat_slot_unlocks:      number[];
}

interface DetailsLoot {
    hero_id: number;
    slot_id: number;
    rarity:  number;
    gild:    number;
    enchant: number;
    found:   { [key: string]: number };
}

interface ModronSave {
    user_id:           string;
    core_id:           string;
    grid:              Array<number[]>;
    instance_id:       string;
    exp_total:         string;
    formation_saves:   { [key: string]: number };
    area_goal:         string;
    buffs:             { [key: string]: number };
    checkin_timestamp: string;
    properties:        ModronSaveProperties;
}

interface ModronSaveProperties {
    formation_enabled:  boolean;
    toggle_preferences: TogglePreferences;
}

interface TogglePreferences {
    formation: boolean;
    reset:     boolean;
    buff:      boolean;
}

interface MusicPlayer {
    playlist: any[];
    volume:   number;
}

interface Options {
    sound:                         number;
    music:                         string;
    muted:                         string;
    mute_familiar_attacks:         number;
    auto_pause:                    number;
    auto_progress:                 string;
    quality:                       number;
    chat_enabled:                  number;
    force_scientific:              string;
    force_offline_auto_progress:   number;
    skip_chest_drop:               number;
    hide_stars:                    number;
    dismiss_new_mission:           number;
    hide_formation_circles:        number;
    skip_cinematics_in_freeplay:   string;
    mute_when_not_active:          string;
    disable_lightning:             number;
    disable_blood:                 number;
    hide_completed_variants:       string;
    hide_locked_variants:          number;
    disable_screen_shake:          number;
    level_up_amount_index:         number;
    cinematic_speed:               string;
    disable_fkey_leveling:         string;
    dps_display_style:             string;
    effect_description_style:      string;
    upgrade_list_show_upcoming:    string;
    upgrade_list_combine_upgrades: number;
    hide_unavailable_patron_items: string;
    particle_percent:              number;
    target_framerate:              number;
    auto_progress_2:               string;
    auto_progress_3:               string;
}

interface PackageDeal {
    item_id:                    number;
    name:                       string;
    description:                string;
    cost:                       number;
    sale:                       boolean;
    discount:                   Discount;
    original_cost:              number;
    sale_time_remaining:        number;
    sale_notification:          number | string;
    sale_notification_console:  number | string;
    notification_background_id: number;
    notification_icon_id:       number;
    notification_text:          string;
    background_graphic_id:      number;
    new_shop_graphic_id:        number;
    loot_ids:                   number[];
    loot:                       PackageDealLoot[];
    chests:                     number;
    chest_type_id:              number;
    value_key:                  ValueKey;
    value_amount:               number;
    selector_button_graphic:    number;
    starter_pack_graphic:       number;
    contained_pack_ids:         any[];
    container_pack_id:          number;
    hide_notification:          boolean;
}

declare enum Discount {
    Empty = "",
    NewDLC = "New DLC!",
}

interface PackageDealLoot {
    loot_id?:                number;
    gild_level?:             number;
    hero_id?:                number;
    skin_id?:                number;
    chest_type_id?:          number;
    count?:                  number;
    familiar_id?:            number;
    buff_id?:                number;
    modron_crafting_pieces?: number;
    award_gems?:             number;
    feat_id?:                number;
    familiar_skin_id?:       number;
    graphic_id?:             number;
    message?:                string;
    name?:                   string;
    rarity?:                 number;
    type?:                   string;
}

declare enum ValueKey {
    StartPackValueMessage = "start_pack_value_message",
}

interface PatronPerk {
    patron_perk_id: number;
    level:          string;
}

interface Patron {
    patron_id:                 number | string;
    unlocked:                  boolean;
    tier?:                     string;
    influence_current_amount?: string;
    influence_total_earned?:   string;
    influence_total_spent?:    string;
    currency_current_amount?:  string;
    currency_total_earned?:    string;
    currency_total_spent?:     string;
    challenge_ids?:            any[];
    challenge_data?:           any[];
    challenge_start?:          string;
    challenge_end?:            string;
    adventure_progress?:       AdventureProgress;
    progress_bars?:            ProgressBar[];
    stats?:                    PatronStatClass[];
    shop_items?:               { [key: string]: ShopItem };
    next_shop_reset?:          number;
    next_free_play_reset?:     number;
    meets_requirements?:       boolean[];
}

interface AdventureProgress {
    percent: number;
    count:   number;
    goal:    number;
}

interface ProgressBar {
    id:      string;
    label:   string;
    percent: number;
    count:   number;
    goal:    number;
}

interface ShopItem {
    available:           boolean;
    available_amount?:   number;
    reason?:             Reason;
    weekly_cooldown?:    number;
    influence_required?: number;
}

declare enum Reason {
    AlreadyPurchasedMaxAllowedAmount = "already_purchased_max_allowed_amount",
    AlreadyPurchasedMaxAllowedAmountThisWeek = "already_purchased_max_allowed_amount_this_week",
    NotEarnedEnoughTotalInfluence = "not_earned_enough_total_influence",
}

interface PatronStatClass {
    id:    string;
    label: string;
    value: number | string;
}

interface Promotion {
    promotion_id:          string;
    name:                  string;
    start_date:            Date;
    end_date:              null;
    offer_requirements:    any[];
    purchase_requirements: PurchaseRequirement[];
    effects:               PromotionEffect[];
    permanent_order:       string;
    num_allowed:           string;
    properties:            PromotionProperties;
}

interface PromotionEffect {
    type:       EffectType;
    loot_id:    number;
    gild_level: number;
}

interface PromotionProperties {
    notification?: Notification;
    shop:          Shop;
}

interface Notification {
    notification_background_id: number;
    type:                       string;
    text:                       string;
    graphic:                    number;
    during_events:              boolean;
}

interface Shop {
    type:            ShopType;
    loot_id:         number;
    gild_level:      number;
    text:            string;
    event_purchase?: number;
    hero_purchase?:  number;
}

declare enum ShopType {
    BonusLoot = "bonus_loot",
}

interface PurchaseRequirement {
    type:      PurchaseRequirementType;
    value:     number[] | ValueEnum;
    event_id?: number;
    hero_id?:  number;
}

declare enum PurchaseRequirementType {
    PremiumItems = "premium_items",
    PurchaseType = "purchase_type",
}

declare enum ValueEnum {
    EventChests = "event_chests",
    RareChests = "rare_chests",
}

interface ResetCurrency {
    currency_id:         number;
    current_amount:      string;
    total_earned:        string;
    total_spent:         string;
    converted_currency:  ConvertedCurrency[];
    convert_start_time?: number;
    convert_end_time?:   number;
    force_convert?:      boolean;
    hard_force_convert?: boolean;
    convert_multiplier?: number;
    convert_data?:       ConvertDatum[];
}

interface ConvertDatum {
    currency_id:  number;
    multiplier:   number;
    amount:       string;
    base_amount:  string;
    bonus_amount: string;
}

interface ConvertedCurrency {
    time:        number;
    currency_id: string;
    converted:   string;
    earned:      number;
}

interface Tile {
    tile_id: number;
    count:   number;
}

interface TimeGates {
    time_gate_reset_currency_id: number;
    time_gate_key_pieces:        number;
    recent_champions:            { [key: string]: number };
    time_gate_available:         TimeGateAvailable;
}

interface TimeGateAvailable {
    time_to_free_gate:   number;
    available_champions: AvailableChampion[];
}

interface AvailableChampion {
    champion_id:            number;
    event_title_graphic_id: number;
    objective_levels:       number[];
    rewards:                Array<AvailableChampionReward[]>;
    cost:                   number;
    sort_stats:             SortStats;
    blackout:               boolean;
}

interface AvailableChampionReward {
    reward:         RepeatRewardReward;
    crusader_id?:   string;
    chest_type_id?: number;
}

interface SortStats {
    popularity: number;
    event_time: number;
    ilvl:       number;
}

interface TrialsData {
    active_campaign_id:                 number;
    player_name:                        string;
    faq_key:                            string;
    next_player_name_update_seconds:    number;
    last_sending_stone_read:            number;
    highest_available_difficulty:       number;
    difficulty_token_inventory:         DifficultyTokenInventory;
    normal_difficulty_token_name:       string;
    normal_difficulty_token_graphic_id: number;
    any_difficulty_token_name:          string;
    any_difficulty_token_graphic_id:    number;
    unavailable_hero_ids:               any[];
    difficulty_reward_lookup:           { [key: string]: DifficultyRewardLookup[] };
    role_reward_lookup:                 { [key: string]: RoleRewardLookup[] };
    campaigns:                          any[];
    refresh_seconds:                    number;
}

interface DifficultyRewardLookup {
    reward:         DifficultyRewardLookupReward;
    mult?:          number;
    graphic_id?:    number;
    name?:          string;
    amount?:        number;
    stat?:          StatEnum;
    amount_range?:  number[];
    chest_type_id?: number;
}

declare enum DifficultyRewardLookupReward {
    Chest = "chest",
    IncrementUserStat = "increment_user_stat",
    TiamatScaleMult = "tiamat_scale_mult",
}

declare enum StatEnum {
    MultiplayerPoints = "multiplayer_points",
}

interface DifficultyTokenInventory {
    normal: number;
    any:    number;
}

interface RoleRewardLookup {
    reward:  string;
    skin_id: number;
}

interface TwitchAccountDetails {
    twitch_login_name: string;
    token_still_valid: boolean;
    can_stream:        string;
}
