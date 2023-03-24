import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackBtn from "../components/BackBtn";
import FileSaver from "file-saver";
import { GraphQLEditor, PassedSchema } from "graphql-editor";
import { queryModelGraphql } from "../api";
import { ModeQueryResult } from "../types";
import { schemas } from "../utils/composedb-types/schemas";
import { AxiosError } from "axios";

export default function ModelView() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [modelData, setModelData] = useState<ModeQueryResult>();
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
  });
  const [errMsg, setErrMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const fetchModelGraphql = useCallback(async (streamId: string) => {
    try {
      setLoading(true);
      const resp = await queryModelGraphql(streamId);
      const { data } = resp.data;
      setModelData(data);
      setGqlSchema({
        code: data.graphqlSchema,
      });
    } catch (error) {
      const err = error as AxiosError;
      setErrMsg((err.response?.data as any).message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    FileSaver.saveAs(blob, filename);
  };

  useEffect(() => {
    if (!streamId) return;
    fetchModelGraphql(streamId);
  }, [fetchModelGraphql, streamId]);
  // return <div>{streamId}</div>;

  if (loading) {
    return (
      <PageBox>
        <Loading>Loading...</Loading>
      </PageBox>
    );
  }

  if (errMsg) {
    return (
      <PageBox>
        <div className="title-box">
          <BackBtn
            backAction={() => {
              navigate(-1);
            }}
          />
        </div>
        <Loading>{errMsg}</Loading>
      </PageBox>
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
      </div>

      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setGqlSchema(props);
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <div className="result-box">
        {modelData?.composite && (
          <div>
            <div className="title">
              <h3>Model's composite</h3>
              <button
                onClick={() => {
                  download(
                    JSON.stringify(modelData.composite),
                    "composite.json"
                  );
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>{JSON.stringify(modelData.composite, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
        {modelData?.runtimeDefinition && (
          <div>
            <div className="title">
              <h3>Model's runtime definition</h3>
              <button
                onClick={() => {
                  download(
                    `// This is an auto-generated file, do not edit manually
export const definition = ${JSON.stringify(modelData.runtimeDefinition)}`,
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
                  {JSON.stringify(modelData.runtimeDefinition, null, 2)}
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

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`;
