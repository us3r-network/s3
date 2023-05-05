import { AxiosError, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import { getStreamInfo } from "../api";
import StreamTable from "../components/StreamTable";
import { Network, Stream } from "../types";
import { useCeramicCtx } from "../context/CeramicCtx";

export default function StreamPage() {
  const { streamId } = useParams();
  const { network } = useCeramicCtx();
  const [stream, setStream] = useState<Stream>();
  const [serverErrMsg, setServerErrMsg] = useState<{
    status: number;
    msg: string;
  }>();
  const [unknownErr, setUnknownErr] = useState<string>();

  const loadStreamInfo = async (network: Network, streamId: string) => {
    try {
      const resp = await getStreamInfo(network, streamId);
      setStream(resp.data.data);
    } catch (error) {
      const err = error as Error | AxiosError;
      if (isAxiosError(err) && err.response) {
        setServerErrMsg({
          status: err.response.status,
          msg: err.response.data.msg,
        });
      } else {
        setUnknownErr(err.message);
      }
    }
  };

  useEffect(() => {
    if (!streamId || !network) return;
    setServerErrMsg(undefined);
    setUnknownErr(undefined);
    loadStreamInfo(network as Network, streamId);
  }, [streamId, network]);

  if (unknownErr) {
    return (
      <PageBox>
        <div className="err">
          <p>{unknownErr}</p>
          <p>
            <Link to="/">Go to the home page</Link>
          </p>
        </div>
      </PageBox>
    );
  }

  if (serverErrMsg) {
    return (
      <PageBox>
        <div className="err">
          <h3>{serverErrMsg.status}</h3>

          <p className="msg">{serverErrMsg.msg}</p>
          <p>
            <Link to="/">Go to the home page</Link>
          </p>
        </div>
      </PageBox>
    );
  }

  return (
    <PageBox isMobile={isMobile}>
      <BackContainer />
      {stream && <StreamTable data={stream} network={network as Network} />}
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

const PageBox = styled.div<{ isMobile?: boolean }>`
  margin-bottom: 50px;
  ${({ isMobile }) => (isMobile ? `padding: 0 10px;` : "")};

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
