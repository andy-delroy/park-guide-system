<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
class DumpIt extends Command
{
    protected $signature = 'unload:on-me {table}';
    protected $description = 'Dump table schema to JSON';
    public function handle()
    {
        $table = $this->argument('table');

        // Use SQLite-specific PRAGMAs
        $columns = DB::select('PRAGMA table_info(' . $table . ')');
        $foreignKeys = DB::select('PRAGMA foreign_key_list(' . $table . ')');
        $indexes = DB::select('PRAGMA index_list(' . $table . ')');

        $schema = [
            'columns' => $columns,
            'foreign_keys' => $foreignKeys,
            'indexes' => $indexes,
        ];

        file_put_contents('schema_' . $table . '.json', json_encode($schema, JSON_PRETTY_PRINT));
        $this->info("SQLite schema dumped to schema_{$table}.json");
    }
}
