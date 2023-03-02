import { useState } from "react";

import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackBtn from "../components/BackBtn";
import { submitComposeDBModel } from "../utils/creamic-composedb";
import FileSaver from "file-saver";
import { CERAMIC_NODE } from "../constants";

// import { GraphQLEditor, PassedSchema } from 'graphql-editor';

// const schemas = {
//   pizza: `
// type Query{
// 	pizzas: [Pizza!]
// }
// `,
//   pizzaLibrary: `
// type Pizza{
//   name:String;
// }
// `,
// };
export default function ModelCreate() {
  const navigate = useNavigate();
  const [ceramicNode, setCeramicNode] = useState(CERAMIC_NODE);
  const [graphql, setGraphql] = useState('');
  const [composite, setComposite] = useState('');
  const [runtimeDefinition, setRuntimeDefinition] = useState('');
  // const [mySchema, setMySchema] = useState<PassedSchema>({
  //   code: schemas.pizza,
  //   libraries: schemas.pizzaLibrary,
  // });

  const submit = async () => {
    const result = await submitComposeDBModel(graphql, ceramicNode)
    if (result) {
      setComposite(JSON.stringify(result.composite.toJSON()))
      setRuntimeDefinition(JSON.stringify(result.runtimeDefinition))
    }
  }

  const download = (text: string, filename: string) => {
    console.log(text)
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    });

    FileSaver.saveAs(blob, filename);
  };


  return (
    <PageBox>
      <div className="title-box">
        <BackBtn
          backAction={() => {
            navigate(-1);
          }}
        />
        <button onClick={() => {
          submit()
        }}>submit</button>
      </div>
      {/* <GraphQLEditor
        setSchema={(props) => {
          setMySchema(props);
        }}
        schema={mySchema}
      /> */}
      <input
        title="ceramic node"
        type="text"
        value={ceramicNode}
        onChange={(e) => {
          setCeramicNode(e.target.value);
        }} />
      <textarea
        className='model-code'
        onChange={(e) => {
          setGraphql(e.target.value);
        }} />
      <div className="result-box">
        <div>
          <textarea>{composite}</textarea>
          <button onClick={() => {
            download(composite, "my-composite.json")
          }}>download composite</button>
        </div>
        <div>
          <textarea>{runtimeDefinition}</textarea>
          <button onClick={() => {
            download(runtimeDefinition, 'runtime-composite.json')
          }}>download runtime definition</button>
        </div>
      </div>
    </PageBox >
  );
}


const PageBox = styled.div`
  margin-bottom: 50px;
  > .err {
    display: flex;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & .msg {
      color: darkgray;
    }
  }

  .title-box{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0px ;
  }

  .model-code{
    width: 100%;
    height: 300px;
    font-size: 14px;
    line-height: 24px;
  }

  .result-box{
    display: flex;
    flex-direction:row;
    gap: 20px;
    width: 100%;
    div{
      width: 50%;
      margin: 20px 0px ;
    }
    textarea{
      width: 100%;
      height: 300px;
      word-wrap:break-word;
    }
  }
`;

