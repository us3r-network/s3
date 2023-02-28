import { Stream } from "@ceramicnetwork/common";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackBtn from "../components/BackBtn";
import { TableBox } from "../components/TableBox";
import { CERAMIC_PROXY } from "../constants";

const ceramicIndexer = new CeramicClient(
  CERAMIC_PROXY || "http://13.215.254.225:3000"
);

export default function ModelStream() {
  const { streamId } = useParams();
  const [stream, setStream] = useState<Stream>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!streamId) return;
    setLoading(true);
    ceramicIndexer
      .loadStream(streamId)
      .then((data) => {
        setStream(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [streamId]);

  return (
    <PageBox>
      <BackContainer>
        <BackBtn
          backAction={() => {
            navigate(-1);
          }}
        />
        <h3>{stream?.content.name}</h3>
      </BackContainer>

      <TableBox>
        <TableContainer>
          {(loading && <div className="loading">Loading...</div>) || (
            <div className="content">
              <div>
                <pre>
                  <code>{JSON.stringify(stream?.content, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </TableContainer>
      </TableBox>
    </PageBox>
  );
}

const BackContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  position: sticky;
  background-color: #14171a;
  top: 0;
  z-index: 100;

  > div {
    cursor: pointer;
    padding: 10px;
    gap: 8px;
    box-sizing: border-box;
    width: 81px;
    height: 40px;
    display: flex;
    align-items: center;

    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 100px;

    font-weight: 400;
    font-size: 14px;
    line-height: 17px;

    color: #718096;
  }
`;

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
`;

const TableContainer = styled.div`
  padding: 10px;

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 50px;
  }
`;
