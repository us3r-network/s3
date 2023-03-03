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
      console.log(result, '\n', JSON.stringify(result.composite.toJSON()), '\n', JSON.stringify(result.runtimeDefinition))
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
      <h3>ceramic node</h3>
      <input
        title="ceramic node"
        className='node-input'
        placeholder="input your ceramic node url here."
        type="text"
        value={ceramicNode}
        onChange={(e) => {
          setCeramicNode(e.target.value);
        }} />
      <h3>your model's graphql</h3>
      <textarea
        className='model-code'
        placeholder="input your graphql code here."
        onChange={(e) => {
          setGraphql(e.target.value);
        }} />
      <div className="result-box">
        {composite &&
          <div>
            <h3>your model's composite</h3>
            <div className='result-text'>{composite}</div>
            <button onClick={() => {
              download(composite, "my-composite.json")
            }}>
              download composite
            </button>
          </div>
        }
        {runtimeDefinition &&
          <div>
            <h3>your model's runtime definition</h3>
            <div className='result-text'>{runtimeDefinition}</div>
            <button onClick={() => {
              download(runtimeDefinition, 'runtime-composite.json')
            }}>
              download runtime definition
            </button>
          </div>
        }
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
  .node-input{
    width: 50%;
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
    .result-text{
      width: 100%;
      word-wrap:break-word;
    }
  }
`;

