import { parse } from 'graphql/language';
import { of } from 'rxjs';

export function parseToCreateModelGraphqls(graphql: string): Map<string, string[]> {
    const modelGraphqlsMap = new Map<string, string[]>();
    if (!graphql || graphql.length == 0) return modelGraphqlsMap

    const ast = parse(graphql);
    if (!ast || ast.definitions.length == 0) return modelGraphqlsMap;

    const createModelCount = (graphql.match(/@createModel/g) || []).length
    if (createModelCount < 2) {
        const definitions = ast.definitions;
        for (let index = 0; index < definitions.length; index++) {
            const definition: any = definitions[index];
            const name = definition.name.value;
            if (definition.directives?.length > 0 && definition.directives[0].name.value == 'createModel') {
                modelGraphqlsMap.set(name, [graphql]);
                break;
            }
        }
    }else {
        const enumTypeDefinitionMap = new Map<string, any>();
        const objectTypeDefinitionMap = new Map<string, any>();
        const definitions = ast.definitions;
        definitions.forEach((definition: any) => {
            const name = definition.name.value;
            const kand = definition.kind;
            const directives = definition.directives;
            // currently only support createModel directive
            if (definition.directives?.length > 0 && definition.directives[0].name.value == 'createModel') {
                const modelGraphqls = [];
                // iterate fields
                definition.fields.forEach((field: any) => {
                    // parse object type
                    const objectTypeName = field.type?.name?.value;
                    if (objectTypeName) {
                        if (objectTypeDefinitionMap.get(objectTypeName)) {
                            modelGraphqls.push(objectTypeDefinitionMap.get(objectTypeName).loc.source.body.slice(objectTypeDefinitionMap.get(objectTypeName).loc.start, objectTypeDefinitionMap.get(objectTypeName).loc.end));
                        }
                    }
    
                    // parse enum type
                    const enumTypeName = field.type?.type?.name?.value;
                    if (enumTypeName) {
                        if (enumTypeDefinitionMap.get(enumTypeName)) {
                            modelGraphqls.push(enumTypeDefinitionMap.get(enumTypeName).loc.source.body.slice(enumTypeDefinitionMap.get(enumTypeName).loc.start, enumTypeDefinitionMap.get(enumTypeName).loc.end));
                        }
                    }
                });
                modelGraphqls.push(definition.loc.source.body.slice(definition.loc.start, definition.loc.end));
                modelGraphqlsMap.set(name, modelGraphqls);
            }
    
            // build enum/object type definition map
            if (kand == 'EnumTypeDefinition') {
                enumTypeDefinitionMap.set(name, definition);
            } else if (kand == 'ObjectTypeDefinition') {
                if (directives?.length > 0 && directives[0].name.value == 'loadModel') {
                    objectTypeDefinitionMap.set(name, definition);
                }
            } else {
                // TODO: handle other kind
                console.log(`unknown kind: ${kand}`);
            }
        });
    }
    
    return modelGraphqlsMap;
}

export function generateLoadModelGraphqls(sourceGraphql: string, targetModel: string, modelStreamIdMap: Map<string, string>): string[] {
    const loadModelGraphqls: string[] = [];
    const modelGraphqlsMap = parseToCreateModelGraphqls(sourceGraphql);
    if (modelGraphqlsMap.size == 0) return [];

    const modelGraphqls = modelGraphqlsMap.get(targetModel);
    if (!modelGraphqls || modelGraphqls?.length == 0) return [];

    const createModelGraphql = modelGraphqls.find((modelGraphql: string) =>
        modelGraphql.replace(/(\r\n|\n|\r|\s)/g, "").includes(`type${targetModel}@createModel`)
    );
    const ast = parse(createModelGraphql);
    const definitions = ast.definitions;

    definitions?.forEach((definition: any) => {
        definition?.fields?.forEach((field: any) => {
            if (field.type.kind == 'NamedType') {
                const typeName = field.type.name.value;
                const streamId = modelStreamIdMap.get(typeName);
                if (streamId) {
                    const loadModelGraphql = `
                    type ${typeName} @loadModel(id: "${streamId}") {
                        id: ID!
                      }`;
                    loadModelGraphqls.push(loadModelGraphql);
                }
            }
        });
    });

    return loadModelGraphqls;
}
