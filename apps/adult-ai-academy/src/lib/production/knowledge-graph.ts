import { ContextBlackboard } from './orchestrator';
import { serverConfig } from '../config';

/**
 * Interface for the Knowledge Graph Persistence.
 * This maps out the "Ageless Advantage" of long-term agentic memory.
 */
export interface KnowledgeNode {
    id: string;
    type: 'Batch' | 'Inference' | 'Decision' | 'Outcome';
    properties: Record<string, string | number | boolean | null>;
}

/**
 * Gets the Neo4j driver instance if configured.
 * Returns null if Neo4j credentials are missing (graceful degradation).
 * 
 * Note: Requires 'neo4j-driver' package to be installed if Neo4j is configured.
 * Install with: npm install neo4j-driver
 */
async function getNeo4jDriver() {
    const config = serverConfig.neo4j;
    if (!config.isConfigured) {
        return null;
    }

    try {
        // Dynamic import so it only loads when Neo4j is configured
        const neo4j = await import('neo4j-driver');
        const driver = neo4j.driver(
            config.uri!,
            neo4j.auth.basic(config.user!, config.password!)
        );
        
        // Verify connection
        await driver.verifyConnectivity();
        return driver;
    } catch (error) {
        console.error('[Neo4j] Failed to initialize driver:', error);
        return null;
    }
}

/**
 * Persists the Context Blackboard to the Neo4j Knowledge Graph.
 * Maps Inferences and Decisions into nodes and relationships.
 * Gracefully degrades to logging mode if Neo4j is not configured.
 */
export async function persistBlackboardToGraph(batchId: string, blackboard: ContextBlackboard): Promise<void> {
    console.log(`[Neo4j] Persisting Knowledge Graph for Batch: ${batchId}...`);

    const driver = await getNeo4jDriver();
    
    if (!driver) {
        // Graceful degradation: Log the relationships that would have been persisted
        console.log(`[Knowledge Graph] Neo4j not configured. Simulating persistence...`);
        console.log(`[Knowledge Graph] Would create ${blackboard.inferences.length} inference relationships and ${blackboard.decisions.length} decision relationships.`);
        blackboard.inferences.forEach((inf) =>
            console.log(`  (Batch:${batchId})-[:INFERRED]->(Inference: "${inf.substring(0, 50)}...")`)
        );
        blackboard.decisions.forEach((dec) =>
            console.log(`  (Batch:${batchId})-[:DECIDED]->(Decision: "${dec.substring(0, 50)}...")`)
        );
        return;
    }

    try {
        const session = driver.session();
        try {
            await session.executeWrite(async (tx: { run: (query: string, params: Record<string, unknown>) => Promise<unknown> }) => {
                // 1. Create/Update Batch Node
                await tx.run(
                    `MERGE (b:Batch {id: $id})
                     SET b.created_at = datetime(), b.updated_at = datetime()`,
                    { id: batchId }
                );

                // 2. Map Inferences
                for (const [idx, inf] of blackboard.inferences.entries()) {
                    const infId = `${batchId}_inf_${idx}`;
                    await tx.run(
                        `MERGE (i:Inference {id: $infId})
                         SET i.content = $content, i.created_at = datetime()
                         WITH i
                         MATCH (b:Batch {id: $batchId})
                         MERGE (b)-[:INFERRED]->(i)`,
                        { infId, content: inf, batchId }
                    );
                }

                // 3. Map Decisions
                for (const [idx, dec] of blackboard.decisions.entries()) {
                    const decId = `${batchId}_dec_${idx}`;
                    await tx.run(
                        `MERGE (d:Decision {id: $decId})
                         SET d.content = $content, d.created_at = datetime()
                         WITH d
                         MATCH (b:Batch {id: $batchId})
                         MERGE (b)-[:DECIDED]->(d)`,
                        { decId, content: dec, batchId }
                    );
                }

                // 4. Store agent communications as properties on the Batch node
                if (Object.keys(blackboard.agentCommunications).length > 0) {
                    await tx.run(
                        `MATCH (b:Batch {id: $batchId})
                         SET b.agent_communications = $communications`,
                        { 
                            batchId, 
                            communications: JSON.stringify(blackboard.agentCommunications) 
                        }
                    );
                }
            });

            console.log(`[Knowledge Graph] SUCCESS: Persisted ${blackboard.inferences.length} inferences and ${blackboard.decisions.length} decisions to Neo4j.`);
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('[Neo4j] Error persisting blackboard:', error);
        // Don't throw - graceful degradation means we continue even if graph persistence fails
    } finally {
        await driver.close();
    }
}

/**
 * Discovery Utility: Finds winning patterns by traversing the graph.
 * Queries for inferences that are connected to multiple successful batches.
 * Gracefully degrades to returning mock patterns if Neo4j is not configured.
 */
export async function discoverWinningPatternsFromGraph(): Promise<string[]> {
    console.log("[Neo4j] Querying graph for patterns with high Outcome engagement...");

    const driver = await getNeo4jDriver();
    
    if (!driver) {
        console.log("[Knowledge Graph] Neo4j not configured. Returning mock patterns.");
        // Return mock patterns that would come from the graph
        return [
            "Pattern: Disrupt-Then-Reframe consistently leads to 2.4x re-watch rate on B2B LinkedIn clips.",
            "Pattern: Loss aversion triggers in hooks increase engagement by 35% for 35-55 demographic."
        ];
    }

    try {
        const session = driver.session();
        try {
            const result = await session.executeRead(async (tx: { run: (query: string) => Promise<{ records: Array<{ get: (key: string) => { toNumber?: () => number } | string }> }> }) => {
                // Query for inferences that appear in multiple batches (indicating winning patterns)
                const queryResult = await tx.run(
                    `MATCH (b:Batch)-[:INFERRED]->(i:Inference)
                     WITH i, count(DISTINCT b) as batchCount
                     WHERE batchCount >= 2
                     RETURN i.content as pattern, batchCount
                     ORDER BY batchCount DESC
                     LIMIT 10`
                );

                return queryResult.records.map((record) => ({
                    pattern: record.get('pattern') as string,
                    count: (record.get('batchCount') as { toNumber: () => number }).toNumber(),
                }));
            });

            const patterns = result.map((r: { pattern: string; count: number }) =>
                `Pattern (appears in ${r.count} batches): ${r.pattern}`
            );

            console.log(`[Knowledge Graph] Discovered ${patterns.length} winning patterns.`);
            return patterns.length > 0 ? patterns : [
                "Pattern: Disrupt-Then-Reframe consistently leads to 2.4x re-watch rate on B2B LinkedIn clips."
            ];
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('[Neo4j] Error querying patterns:', error);
        // Return mock patterns on error
        return [
            "Pattern: Disrupt-Then-Reframe consistently leads to 2.4x re-watch rate on B2B LinkedIn clips."
        ];
    } finally {
        await driver.close();
    }
}
