interface ServerDefinitions {
    success:          boolean;
    play_server:      string;
    analytics_server: string;
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
