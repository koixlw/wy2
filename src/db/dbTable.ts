import { spreads } from "../utils/database";
import { dbSchema } from "./schema";

export const dbTable = {
    insert: spreads({ ...dbSchema }, 'insert'),
    select: spreads({ ...dbSchema }, 'select')
} as const;