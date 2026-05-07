export declare enum CompendiumEntryType {
    RACE = "RACE",
    CLASS = "CLASS",
    SUBCLASS = "SUBCLASS",
    SPELL = "SPELL",
    FEAT = "FEAT",
    ITEM = "ITEM",
    MONSTER = "MONSTER",
    CONDITION = "CONDITION",
    BACKGROUND = "BACKGROUND",
    ORIGIN = "ORIGIN"
}
export interface CompendiumEntry {
    id: string;
    systemId: string;
    type: CompendiumEntryType;
    name: string;
    slug: string;
    source: string;
    isHomebrew: boolean;
    creatorId: string | null;
    data: Record<string, unknown>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CompendiumSearchQuery {
    systemId: string;
    type?: CompendiumEntryType;
    query?: string;
    tags?: string[];
    isHomebrew?: boolean;
    page?: number;
    pageSize?: number;
}
//# sourceMappingURL=index.d.ts.map