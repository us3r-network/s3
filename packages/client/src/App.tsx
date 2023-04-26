import { Routes, Route, Outlet } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import { isMobile } from "react-device-detect";
import relativeTime from "dayjs/plugin/relativeTime";

import { Us3rAuthWithRainbowkitProvider } from "@us3r-network/auth-with-rainbowkit";
import { ProfileStateProvider } from "@us3r-network/profile";

import Stream from "./container/Stream";
import Profile from "./container/Profile";
import Family from "./container/Family";

import Home from "./container/Home";
import Streams from "./container/Streams";
import Nav from "./components/Nav";
import MobileNav from "./components/MobileNav";
import NoMatch from "./components/NoMatch";
import { useGAPageView } from "./hooks/useGoogleAnalytics";
import { CERAMIC_HOST } from "./constants";
import Model from "./container/Model";
import ModelStream from "./container/ModelStream";
import ModelCreate from "./container/ModelCreate";
import UserModels from "./container/UserModels";
import ModelView from "./container/ModelView";
import { PlaygroundGraphiQL } from "./container/Playground";
import ModelStreams from "./container/ModelStreams";
import ModelMidInfo from "./container/ModelMidInfo";


dayjs.extend(relativeTime);

export default function App() {
  return (
    <Us3rAuthWithRainbowkitProvider>
      <ProfileStateProvider
        ceramicHost={CERAMIC_HOST}
        themeConfig={{ mode: "dark" }}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="streams" element={<Streams />} />
            <Route path="/:network/stream/:streamId" element={<Stream />} />
            <Route path="/:network/profile/:did" element={<Profile />} />
            <Route path="/:network/family/:familyOrApp" element={<Family />} />

            <Route path="model" element={<Model />} />
            <Route path="model/:streamId" element={<ModelStream />} />
            <Route path="model/:modelId/mids" element={<ModelStreams />} />
            <Route path="model/:modelId/mids/:mid" element={<ModelMidInfo />} />
            <Route path="model/create" element={<ModelCreate />} />
            <Route path="models/:did" element={<UserModels />} />
            <Route path="modelview/:streamId" element={<ModelView />} />

            <Route path="*" element={<NoMatch />} />
          </Route>
          <Route path="playground/:streamId" element={<PlaygroundGraphiQL />} />
        </Routes>
      </ProfileStateProvider>
    </Us3rAuthWithRainbowkitProvider>
  );
}

function Layout() {
  useGAPageView();
  return (
    <AppContainer isMobile={isMobile}>
      {isMobile ? <MobileNav /> : <Nav />}

      <main>
        <Outlet />
      </main>
    </AppContainer>
  );
}

const AppContainer = styled.div<{ isMobile: boolean }>`
  display: flex;

  > main {
    flex-grow: 1;
    margin: 0 auto;
    width: calc(100vw - 300px);
    max-width: 1300px;
    margin-top: ${(props) => (props?.isMobile ? "60px" : "0")};
    z-index: 0;
  }
`;
