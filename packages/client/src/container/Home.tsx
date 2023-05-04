import styled from "styled-components";
import SearchFilter from "../components/Home/HomeFilter";
import Dashboard from "../components/Home/Dashboard";
import Lists from "../components/Home/Lists";
import { useCallback, useEffect, useState } from "react";
import {  Network, Stats } from "../types";
import { getHomeStats } from "../api";
import { useCeramicCtx } from "../context/CeramicCtx";



export default function Home() {
  const [stats, setStats] = useState<Stats>()
  const { network } = useCeramicCtx();
  
  const fetchHomeStats = useCallback( async (network: Network) => {
    const resp = await getHomeStats({ network })
    setStats(resp.data.data)
  }, [])

  useEffect(() => {
    fetchHomeStats(network)
  }, [fetchHomeStats, network])

  return (
    <Box>
      <SloganBox>
        <div className="left">
          <h1>S3.xyz</h1>
          <h3>Hub For Your Fragmented Self Sovereign Data</h3>
          <SearchFilter />
        </div>
        <ImgBox>
          <img src="homebn.png" alt="" />
        </ImgBox>
      </SloganBox>
      <Dashboard data={stats}/>
      <Lists/>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ImgBox = styled.div`
  text-align: center;
`;

const SloganBox = styled.div`
  background: linear-gradient(90deg, #21213a 0%, #2b3569 100.92%);
  mix-blend-mode: normal;
  border-radius: 20px;
  padding: 20px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1.3fr 1fr;

  div.left {
    padding: 80px 40px;
  }

  h1 {
    font-style: italic;
    font-weight: 700;
    font-size: 48px;
    line-height: 57px;
    color: #ffffff;
    margin: 0;
  }

  h3 {
    font-family: "Rubik";
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 28px;

    color: #ffffff;
    margin: 0;
  }
`;
