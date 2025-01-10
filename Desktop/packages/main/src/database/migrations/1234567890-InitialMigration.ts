import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InitialMigration1234567890 implements MigrationInterface {
    name = 'InitialMigration1234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Projects table
        await queryRunner.createTable(new Table({
            name: "Projects",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "version",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "settings",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "last_modified",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create DroneTypes table
        await queryRunner.createTable(new Table({
            name: "DroneTypes",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "sensor_width",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "sensor_height",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "focal_length",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "image_width",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "image_height",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "max_speed",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "max_altitude",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create Routes table
        await queryRunner.createTable(new Table({
            name: "Routes",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "project_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "drone_type_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "fly_to_wayline_mode",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "finish_action",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "exit_on_rc_lost",
                    type: "boolean",
                    default: true
                },
                {
                    name: "execute_rc_lost_action",
                    type: "boolean",
                    default: true
                },
                {
                    name: "global_transitional_speed",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "wayline_id",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "distance",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "duration",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "auto_flight_speed",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "max_flight_speed",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "return_to_home_altitude",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "last_modified",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create Waypoints table
        await queryRunner.createTable(new Table({
            name: "Waypoints",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "route_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "sequence_number",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "latitude",
                    type: "double",
                    isNullable: false
                },
                {
                    name: "longitude",
                    type: "double",
                    isNullable: false
                },
                {
                    name: "elevation",
                    type: "float",
                    isNullable: false
                },
                {
                    name: "speed",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "heading_mode",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "heading",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "turn_mode",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "gimbal_pitch",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "stay_time",
                    type: "float",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create Actions table
        await queryRunner.createTable(new Table({
            name: "Actions",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "action_actuator_func",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create ActionParams table
        await queryRunner.createTable(new Table({
            name: "ActionParams",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "action_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_actuator_func_name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "action_actuator_func_value",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create ActionGroups table
        await queryRunner.createTable(new Table({
            name: "ActionGroups",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create ActionActionGroupJoinTable table
        await queryRunner.createTable(new Table({
            name: "ActionActionGroupJoinTable",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_group_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create ActionGroupWaypointJoinTable table
        await queryRunner.createTable(new Table({
            name: "ActionGroupWaypointJoinTable",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "waypoint_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_group_id",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_group_start_index",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_group_end_index",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "action_group_mode",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Add foreign keys
        await queryRunner.createForeignKey("Routes", new TableForeignKey({
            columnNames: ["project_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "Projects",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("Routes", new TableForeignKey({
            columnNames: ["drone_type_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "DroneTypes"
        }));

        await queryRunner.createForeignKey("Waypoints", new TableForeignKey({
            columnNames: ["route_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "Routes",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ActionParams", new TableForeignKey({
            columnNames: ["action_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "Actions",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ActionActionGroupJoinTable", new TableForeignKey({
            columnNames: ["action_group_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "ActionGroups",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ActionActionGroupJoinTable", new TableForeignKey({
            columnNames: ["action_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "Actions",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ActionGroupWaypointJoinTable", new TableForeignKey({
            columnNames: ["waypoint_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "Waypoints",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ActionGroupWaypointJoinTable", new TableForeignKey({
            columnNames: ["action_group_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "ActionGroups",
            onDelete: "CASCADE"
        }));

        // Create indexes
        await queryRunner.createIndex("Routes", new TableIndex({
          name: "IDX_ROUTES_PROJECT",
          columnNames: ["project_id"]
      }));
      
      await queryRunner.createIndex("Waypoints", new TableIndex({
          name: "IDX_WAYPOINTS_ROUTE",
          columnNames: ["route_id"]
      }));
      
      await queryRunner.createIndex("ActionParams", new TableIndex({
          name: "IDX_ACTION_PARAMS_ACTION", 
          columnNames: ["action_id"]
      }));
      
      await queryRunner.createIndex("ActionActionGroupJoinTable", new TableIndex({
          name: "IDX_ACTION_GROUP_JOIN_GROUP",
          columnNames: ["action_group_id"]
      }));
      
      await queryRunner.createIndex("ActionGroupWaypointJoinTable", new TableIndex({
          name: "IDX_ACTION_WAYPOINT_JOIN",
          columnNames: ["waypoint_id", "action_group_id"]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.dropIndex("ActionGroupWaypointJoinTable", "IDX_ACTION_WAYPOINT_JOIN");
        await queryRunner.dropIndex("ActionActionGroupJoinTable", "IDX_ACTION_GROUP_JOIN_GROUP");
        await queryRunner.dropIndex("ActionParams", "IDX_ACTION_PARAMS_ACTION");
        await queryRunner.dropIndex("Waypoints", "IDX_WAYPOINTS_ROUTE");
        await queryRunner.dropIndex("Routes", "IDX_ROUTES_PROJECT");

        // Drop tables in reverse order
        await queryRunner.dropTable("ActionGroupWaypointJoinTable");
        await queryRunner.dropTable("ActionActionGroupJoinTable");
        await queryRunner.dropTable("ActionGroups");
        await queryRunner.dropTable("ActionParams");
        await queryRunner.dropTable("Actions");
        await queryRunner.dropTable("Waypoints");
        await queryRunner.dropTable("Routes");
        await queryRunner.dropTable("DroneTypes");
        await queryRunner.dropTable("Projects");
    }
} 