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
    status = (
      <div className="loading">
        <img src="/loading.gif" title="loading" alt="" />{" "}
        <span>submitting</span>
      </div>
    );
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
        />
      </EditorBox>
      <div className="result-box">
        {composite && (
          <div>
            <div className="title">
              <h3>Model's composite</h3>
              <button
                onClick={() => {
                  download(composite, "my-composite.json");
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>{JSON.stringify(JSON.parse(composite), null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
        {runtimeDefinition && (
          <div>
            <div className="title">
              <h3>Model's runtime definition</h3>
              <button
                onClick={() => {
                  download(
                    `// This is an auto-generated file, do not edit manually
export const definition = ${runtimeDefinition}`,
                    "runtime-composite.js"
                  );
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>
                  {JSON.stringify(JSON.parse(runtimeDefinition), null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </PageBox>
  );
}

const EditorBox = styled.div`
  height: calc(100vh - 300px);
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;
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
    padding: 10px 0px;
    box-sizing: border-box;

    .tools {
      display: flex;
      align-items: center;
      gap: 15px;

      > button {
        background: #ffffff;
      }
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
    > div {
      background: #1b1e23;
      border: 1px solid #39424c;
      border-radius: 20px;
    }
    div {
      width: calc(50% - 10px);
      margin: 20px 0px;
      padding: 10px;
      box-sizing: border-box;
      background-color: #1a1a1c;
      .title {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0;
        font-weight: 700;
        font-size: 24px;
        line-height: 28px;
        font-style: italic;
        color: #ffffff;

        button {
          background: #ffffff;
        }

        h3 {
          margin: 0;
          padding: 0;
        }
      }
    }
    .result-text {
      width: 100%;
      word-wrap: break-word;
      color: #718096;
      overflow: scroll;
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

  .loading {
    display: flex;
    align-items: center;
    gap: 5px;
    img {
      width: 25px;
      height: 25px;
    }
  }
`;
