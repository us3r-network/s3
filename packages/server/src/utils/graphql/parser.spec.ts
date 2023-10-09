import { generateLoadModelGraphqls, parseToCreateModelGraphqls } from "./parser";

describe('parse schema to graphql', () => {
  it('Parse the graph', () => {
    const modelGraphqls = parseToCreateModelGraphqls(`
      type Thread @loadModel(id: "kjzl6hvfrbw6cafpnfd031iecghmu2bfuhmm38jzf2pywnr3fsp8sh8ow93oihs") {
        id: ID!
      }
      enum VoteType {
        UP_VOTE
        DOWN_VOTE
      }
      type Vote @createModel(accountRelation: LIST, description: "Vote on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        date: DateTime
        type: VoteType!
      }
      type Score @createModel(accountRelation: LIST, description: "Score on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        text: String! @string(maxLength: 2000)
        value: Int!
        date: DateTime
      }
      `);
      
      expect(modelGraphqls.size).toBe(2);
      expect(modelGraphqls.get('Vote').toString()).toEqual(`type Thread @loadModel(id: "kjzl6hvfrbw6cafpnfd031iecghmu2bfuhmm38jzf2pywnr3fsp8sh8ow93oihs") {
        id: ID!
      },enum VoteType {
        UP_VOTE
        DOWN_VOTE
      },type Vote @createModel(accountRelation: LIST, description: "Vote on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        date: DateTime
        type: VoteType!
      }`);
      expect(modelGraphqls.get('Score').toString()).toEqual(`type Thread @loadModel(id: "kjzl6hvfrbw6cafpnfd031iecghmu2bfuhmm38jzf2pywnr3fsp8sh8ow93oihs") {
        id: ID!
      },type Score @createModel(accountRelation: LIST, description: "Score on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        text: String! @string(maxLength: 2000)
        value: Int!
        date: DateTime
      }`);
  });
  
});


describe('generateLoadModelGraphqls', () => {
  it('should generate loadModel graphqls', () => {
    const sourceGraphql = `
      type Thread @createModel(accountRelation: LIST, description: "Thread model") {
        id: ID!
      }
      type Vote @createModel(accountRelation: LIST, description: "Vote model") {
        thread: Thread @relationDocument(property: "threadID")
        text: String! @string(maxLength: 2000)
        value: Int!
        date: DateTime
      }
    `;
    const targetModel = 'Vote';
    const modelStreamIdMap = new Map<string, string>([['Thread', 'abc123']]);
    const loadModelGraphqls = generateLoadModelGraphqls(sourceGraphql, targetModel, modelStreamIdMap);
    expect(loadModelGraphqls).toEqual([`
                    type Thread @loadModel(id: "abc123") {
                        id: ID!
                      }`]);
  });
  
  it('should return empty if modelGraphqlsMap is empty', () => {
    const sourceGraphql = ``;
    const targetModel = 'Vote';
    const modelStreamIdMap = new Map<string, string>([['Thread', 'abc123']]);
    const loadModelGraphqls = generateLoadModelGraphqls(sourceGraphql, targetModel, modelStreamIdMap);
    expect(loadModelGraphqls).toEqual([]);
  });
  
  it('should return empty if modelGraphqls is empty', () => {
    const sourceGraphql = `
      type Thread @createModel(accountRelation: LIST, description: "Thread model") {
        id: ID!
      }
    `;
    const targetModel = 'Vote';
    const modelStreamIdMap = new Map<string, string>([['Thread', 'abc123']]);
    const loadModelGraphqls = generateLoadModelGraphqls(sourceGraphql, targetModel, modelStreamIdMap);
    expect(loadModelGraphqls).toEqual([]);
  });
});