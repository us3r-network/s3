import { Network, Status, Stream } from "../../entities/stream/stream.entity";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import CeramicSubscriberService from "../ceramic.subscriber.service";
import { Test, TestingModule } from '@nestjs/testing';

describe('CeramicSubscriberService Logic Test', () => {

  let service: CeramicSubscriberService;

  // @ts-ignore
  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      find: jest.fn((entity) => entity),
      findOne: jest.fn((entity) => entity),
      // ...
    }),
  );

  type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CeramicSubscriberService,
        // Provide your mock instead of the actual repository
        {
          provide: getRepositoryToken(Stream),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    service = module.get<CeramicSubscriberService>(CeramicSubscriberService);
  });

  it('convert to stream entity', async () => {
    const streamState = JSON.parse('{"type":0,"content":{"type":"object","title":"SocialPost","$schema":"http://json-schema.org/draft-07/schema#","required":["body"],"properties":{"body":{"type":["string","null"]},"data":{"type":["object","null"]},"title":{"type":["string","null"]},"master":{"type":["string","null"]},"context":{"type":["string","null"]},"mentions":{"type":["array","null"],"items":{"required":["did","username"],"properties":{"did":{"type":"string"},"username":{"type":"string"}}}},"reply_to":{"type":["string","null"]},"encryptedBody":{"type":["object","null"],"properties":{"encryptedString":{"type":"string"},"encryptedSymmetricKey":{"type":"string"},"accessControlConditions":{"type":"string"}}},"media":{"type":["array","null"],"items":{"required":["url"],"properties":{"url":{"type":"string","pattern":"^ipfs://.+","maxLength":150},"title":{"type":["string","null"]},"gateway":{"type":["string","null"]}}}}}},"metadata":{"tags":["orbis","schema"],"family":"orbis","unique":"rFMNQ7HDKgbTekf/","controllers":["did:key:z6MkfGLpuLq7vVXU93xRH1mLghA5FmutCGmUWKZ1VuwT3QJu"]},"signature":2,"anchorStatus":0,"log":[{"cid":{"code":133,"version":1,"hash":{"0":18,"1":32,"2":158,"3":247,"4":196,"5":154,"6":240,"7":23,"8":125,"9":107,"10":186,"11":110,"12":7,"13":205,"14":246,"15":214,"16":158,"17":126,"18":145,"19":103,"20":27,"21":239,"22":230,"23":85,"24":3,"25":184,"26":55,"27":120,"28":94,"29":169,"30":16,"31":121,"32":51,"33":188}},"type":0,"timestamp":1663316195},{"cid":{"code":113,"version":1,"hash":{"0":18,"1":32,"2":199,"3":139,"4":213,"5":193,"6":202,"7":208,"8":171,"9":110,"10":124,"11":57,"12":186,"13":33,"14":187,"15":157,"16":247,"17":225,"18":153,"19":19,"20":199,"21":55,"22":42,"23":96,"24":136,"25":8,"26":239,"27":111,"28":154,"29":106,"30":204,"31":153,"32":171,"33":211}},"type":2,"timestamp":1663316195},{"cid":{"code":133,"version":1,"hash":{"0":18,"1":32,"2":208,"3":250,"4":151,"5":52,"6":49,"7":178,"8":139,"9":66,"10":9,"11":183,"12":38,"13":200,"14":158,"15":60,"16":180,"17":26,"18":74,"19":179,"20":89,"21":81,"22":62,"23":212,"24":89,"25":156,"26":165,"27":226,"28":215,"29":111,"30":148,"31":9,"32":129,"33":7}},"type":1,"timestamp":1665054491},{"cid":{"code":113,"version":1,"hash":{"0":18,"1":32,"2":131,"3":218,"4":72,"5":159,"6":134,"7":123,"8":96,"9":176,"10":205,"11":98,"12":38,"13":38,"14":180,"15":203,"16":15,"17":37,"18":150,"19":85,"20":239,"21":227,"22":114,"23":232,"24":141,"25":18,"26":176,"27":31,"28":176,"29":216,"30":34,"31":79,"32":241,"33":165}},"type":2,"timestamp":1665054491},{"cid":{"code":133,"version":1,"hash":{"0":18,"1":32,"2":7,"3":227,"4":231,"5":245,"6":141,"7":142,"8":182,"9":167,"10":44,"11":185,"12":52,"13":131,"14":97,"15":34,"16":219,"17":118,"18":119,"19":116,"20":73,"21":2,"22":229,"23":120,"24":205,"25":137,"26":52,"27":189,"28":111,"29":89,"30":94,"31":233,"32":214,"33":34}},"type":1,"timestamp":1665055391},{"cid":{"code":113,"version":1,"hash":{"0":18,"1":32,"2":120,"3":26,"4":80,"5":83,"6":177,"7":171,"8":14,"9":87,"10":159,"11":112,"12":89,"13":74,"14":234,"15":104,"16":51,"17":78,"18":237,"19":31,"20":151,"21":234,"22":32,"23":162,"24":200,"25":253,"26":125,"27":155,"28":172,"29":18,"30":177,"31":134,"32":186,"33":92}},"type":2,"timestamp":1665055391},{"cid":{"code":133,"version":1,"hash":{"0":18,"1":32,"2":244,"3":129,"4":34,"5":88,"6":192,"7":55,"8":6,"9":15,"10":85,"11":79,"12":205,"13":210,"14":64,"15":148,"16":101,"17":147,"18":230,"19":1,"20":71,"21":24,"22":169,"23":236,"24":202,"25":95,"26":244,"27":183,"28":13,"29":13,"30":22,"31":117,"32":234,"33":6}},"type":1}],"anchorProof":{"root":{"code":113,"version":1,"hash":{"0":18,"1":32,"2":101,"3":176,"4":93,"5":76,"6":27,"7":236,"8":161,"9":153,"10":237,"11":54,"12":36,"13":45,"14":101,"15":251,"16":41,"17":176,"18":0,"19":101,"20":86,"21":20,"22":82,"23":204,"24":64,"25":167,"26":176,"27":59,"28":70,"29":79,"30":238,"31":23,"32":235,"33":121}},"txHash":{"code":147,"version":1,"hash":{"0":27,"1":32,"2":108,"3":97,"4":226,"5":226,"6":191,"7":44,"8":182,"9":135,"10":90,"11":118,"12":252,"13":252,"14":172,"15":224,"16":215,"17":97,"18":61,"19":189,"20":81,"21":210,"22":13,"23":14,"24":126,"25":105,"26":243,"27":138,"28":7,"29":63,"30":204,"31":169,"32":68,"33":206}},"chainId":"eip155:1","blockNumber":15688737,"blockTimestamp":1665055391},"next":{"content":{"type":"object","title":"SocialPost","$schema":"http://json-schema.org/draft-07/schema#","required":["body"],"properties":{"body":{"type":["string","null"]},"data":{"type":["object","null"]},"title":{"type":["string","null"]},"master":{"type":["string","null"]},"context":{"type":["string","null"]},"mentions":{"type":["array","null"],"items":{"required":["did","username"],"properties":{"did":{"type":"string"},"username":{"type":"string"}}}},"reply_to":{"type":["string","null"]},"encryptedBody":{"type":["object","null"],"properties":{"encryptedString":{"type":"string"},"encryptedSymmetricKey":{"type":"string"},"accessControlConditions":{"type":"string"}}},"media":{"type":["array","null"],"items":{"required":["url"],"properties":{"url":{"type":"string","pattern":"^ipfs://.+","maxLength":150},"title":{"type":["string","null"]},"gateway":{"type":["string","null"]}}}},"tags":{"type":["array","null"],"items":{"required":["slug"],"properties":{"slug":{"type":"string"},"title":{"type":["string","null"]}}}}}},"metadata":{"tags":["orbis","schema"],"family":"orbis","unique":"rFMNQ7HDKgbTekf/","controllers":["did:key:z6MkfGLpuLq7vVXU93xRH1mLghA5FmutCGmUWKZ1VuwT3QJu"]}}}');
    const network = Network.TESTNET;
    const streamId = 'k3y52l7qbv1fryjn62sggjh1lpn11c56qfofzmty190d62hwk1cal1c7qc5he54ow';
    const commitIds = ['CommitID(k3y52l7qbv1fryjn62sggjh1lpn11c56qfofzmty190d62hwk1cal1c7qc5he54ow)']

    const stream = service.convertToStreamEntity(network, streamId, commitIds, streamState);
    
    // test some properties
    expect(stream.getType).toBe(0);
    expect(stream.getAnchorStatus).toBe(Status.NOT_ANCHORED);
    expect(stream.getFamily).toBe('orbis');
    expect(stream.getDid).toBe('did:key:z6MkfGLpuLq7vVXU93xRH1mLghA5FmutCGmUWKZ1VuwT3QJu');
    expect(stream.getTags[0]).toBe('orbis');
  });
});
