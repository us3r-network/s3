import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getModelMidItem } from "../api";
import getCurrNetwork from "../utils/getCurrNetwork";
import styled from "styled-components";
import dayjs from "dayjs";

export default function ModelMidInfo() {
  const { modelId, mid } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState<any>();

  const navToStream = useCallback(
    (stream?: string) => {
      if (!stream) return;
      const network = getCurrNetwork();
      navigate(`/${network.toLowerCase()}/stream/${stream}`);
    },
    [navigate]
  );

  const fetchMidInfo = useCallback(async () => {
    if (!modelId || !mid) return;
    const network = getCurrNetwork();
    const resp = await getModelMidItem({
      network,
      midId: mid,
      modelId,
    });
    // console.log(resp.data);
    setInfo(resp.data.data);
  }, [modelId, mid]);

  useEffect(() => {
    fetchMidInfo();
  }, [fetchMidInfo]);

  return (
    <PageBox>
      <div className="title-box" />
      <Table>
        <div>
          <span>StreamID:</span>
          <div
            className="stream-id"
            onClick={() => navToStream(info?.streamId)}
          >
            {info?.streamId}
          </div>
        </div>
        <div>
          <span>controllerDID:</span>
          <div>{info?.controllerDid}</div>
        </div>
        <div>
          <span>streamContent:</span>
          <div>
            <pre>
              <code>{JSON.stringify(info?.streamContent, null, 2)}</code>
            </pre>
          </div>
        </div>
        <div>
          <span>createdAt:</span>
          <div>
            {info?.createdAt &&
              dayjs(info?.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      </Table>
    </PageBox>
  );
}

const Table = styled.div`
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;

  padding: 10px 20px;
  > div {
    display: flex;

    padding: 20px 0;
    border-bottom: 1px solid #39424c;
    word-break: break-all;
    &:first-child {
      padding-top: 15px;
    }
    &:last-child {
      border-bottom: none;
      padding-bottom: 15px;
    }

    > span {
      width: 200px;
      min-width: 200px;
      font-weight: 500;
    }

    > div {
      flex-grow: 1;
    }

    & div {
      overflow: scroll;
    }

    & .stream-id {
      cursor: pointer;
    }
  }
`;

const PageBox = styled.div`
  .title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
    box-sizing: border-box;
  }
`;
