import { useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackBtn from "../components/BackBtn";
import FileSaver from "file-saver";
import { GraphQLEditor, PassedSchema } from "graphql-editor";
import { schemas } from "../utils/composedb-types/schemas";
import { createModel } from "../api";
import { AxiosError } from "axios";

export default function ModelCreate() {
  const navigate = useNavigate();
  const [composite, setComposite] = useState("");
  const [runtimeDefinition, setRuntimeDefinition] = useState("");
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
    libraries: schemas.library,
  });

  const [submitting, setSubmitting] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const resetState = () => {
    setErrMsg("");
    setCreateNew(false);
    setRuntimeDefinition("");
    setComposite("");
    setGqlSchema({
      code: schemas.code,
      libraries: schemas.library,
    });
  };

  const submit = useCallback(async () => {
    setErrMsg("");
    if (!gqlSchema.code) return;
    try {
      setSubmitting(true);
      const resp = await createModel(gqlSchema.code);
      const { composite, runtimeDefinition } = resp.data.data;

      setComposite(JSON.stringify(composite));
      setRuntimeDefinition(JSON.stringify(runtimeDefinition));
      setCreateNew(true);
    } catch (error) {
      const err = error as AxiosError;
      setErrMsg((err.response?.data as any).message || err.message);
    } finally {
      setSubmitting(false);
    }
  }, [gqlSchema.code]);

  const download = (text: string, filename: string) => {
    console.log(text);
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    FileSaver.saveAs(blob, filename);
  };

  let status = (
    <button
      onClick={() => {
        submit();
      }}
    >
      submit
    </button>
  );
  if (submitting) {
    status = <span>submitting</span>;
  }

  if (createNew) {
    status = (
      <button
        onClick={() => {
          resetState();
        }}
      >
        New Model
      </button>
    );
  }

  return (
    <PageBox>
      <div className="title-box">
        <BackBtn
          backAction={() => {
            navigate(-1);
          }}
        />
        <div className="tools">{status}</div>
      </div>
      {errMsg && <div className="err-msg">{errMsg}</div>}
      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setErrMsg("");
            setGqlSchema(props);
          }}
          schema={gqlSchema}
          readonly={createNew}
        />
      </EditorBox>
      <div className="result-box">
        {composite && (
          <div>
            <h3>your model's composite</h3>
            <div className="result-text">{composite}</div>
            <button
              onClick={() => {
                download(composite, "my-composite.json");
              }}
            >
              download composite
            </button>
          </div>
        )}
        {runtimeDefinition && (
          <div>
            <h3>your model's runtime definition</h3>
            <div className="result-text">{runtimeDefinition}</div>
            <button
              onClick={() => {
                download(
                  `// This is an auto-generated file, do not edit manually
export const definition = ${runtimeDefinition}`,
                  "runtime-composite.js"
                );
              }}
            >
              download runtime definition
            </button>
          </div>
        )}
      </div>
    </PageBox>
  );
}

const EditorBox = styled.div`
  height: calc(100vh - 300px);
`;

const PageBox = styled.div`
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

  .title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0px;
    box-sizing: border-box;

    .tools {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }
  .node-input {
    width: 50%;
  }
  .model-code {
    width: 100%;
    height: 300px;
    font-size: 14px;
    line-height: 24px;
  }

  .result-box {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    div {
      width: 50%;
      margin: 20px 0px;
    }
    .result-text {
      width: 100%;
      word-wrap: break-word;
    }
  }

  .err-msg {
    padding: 15px 0 25px 0;
    color: #ef1d1d;
    font-weight: 700;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    /* width: 100px; */
    padding: 0 15px;
    height: 36px;

    border-radius: 100px;
    background: #14171a;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    font-weight: 400;
    color: #a0aec0;
    text-transform: capitalize;
    background: #718096;
    font-weight: 500;
    color: #14171a;
  }
`;
