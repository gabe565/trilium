module.exports = function(attributeFilters) {
    const joins = [];
    const joinParams = [];
    let where = '1';
    const whereParams = [];

    let i = 1;

    for (const filter of attributeFilters) {
        joins.push(`LEFT JOIN attributes AS attribute${i} ON attribute${i}.noteId = notes.noteId AND attribute${i}.name = ? AND attribute${i}.isDeleted = 0`);
        joinParams.push(filter.name);

        where += " " + filter.relation + " ";

        if (filter.operator === 'exists') {
            where += `attribute${i}.attributeId IS NOT NULL`;
        }
        else if (filter.operator === 'not-exists') {
            where += `attribute${i}.attributeId IS NULL`;
        }
        else if (filter.operator === '=' || filter.operator === '!=') {
            where += `attribute${i}.value ${filter.operator} ?`;
            whereParams.push(filter.value);
        }
        else if ([">", ">=", "<", "<="].includes(filter.operator)) {
            const floatParam = parseFloat(filter.value);

            if (isNaN(floatParam)) {
                where += `attribute${i}.value ${filter.operator} ?`;
                whereParams.push(filter.value);
            }
            else {
                where += `CAST(attribute${i}.value AS DECIMAL) ${filter.operator} ?`;
                whereParams.push(floatParam);
            }
        }
        else {
            throw new Error("Unknown operator " + filter.operator);
        }

        i++;
    }

    let searchCondition = '';
    const searchParams = [];

    const query = `SELECT DISTINCT notes.noteId FROM notes
            ${joins.join('\r\n')}
              WHERE 
                notes.isDeleted = 0
                AND (${where}) 
                ${searchCondition}`;

    const params = joinParams.concat(whereParams).concat(searchParams);

    return { query, params };
};