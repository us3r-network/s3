import { Routes, Route, Outlet } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Us3rProfileProvider } from "@us3r-network/profile";
import { Us3rThreadProvider } from "@us3r-network/thread";
import { Us3rAuthProvider, AuthToolType } from "@us3r-network/authkit";

import Stream from "./container/Stream";
import Profile from "./container/Profile";
import Family from "./container/Family";

import Home from "./container/Home";
import Nav from "./components/Nav";
import NoMatch from "./components/NoMatch";
import { useGAPageView } from "./hooks/useGoogleAnalytics";
import { CERAMIC_HOST } from "./constants";
import Model from "./container/Model";
import ModelStream from "./container/ModelStream";
import ModelCreate from "./container/ModelCreate";
import UserModels from "./container/UserModels";

dayjs.extend(relativeTime);

const authToolTypes = [
  AuthToolType.metamask_wallet,
  AuthToolType.phantom_wallet,
];
export default function App() {
  return (
    <Us3rProfileProvider ceramicHost={CERAMIC_HOST}>
      <Us3rThreadProvider ceramicHost={CERAMIC_HOST}>
        <Us3rAuthProvider
          authConfig={{ authToolTypes }}
          themeConfig={{ themeType: "dark" }}
        >
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path=":network/stream/:streamId" element={<Stream />} />
              <Route path=":network/profile/:did" element={<Profile />} />
              <Route path=":network/family/:familyOrApp" element={<Family />} />

              <Route path="model" element={<Model />} />
              <Route path="model/:streamId" element={<ModelStream />} />
              <Route path="model/create" element={<ModelCreate />} />
              <Route path="models/:did" element={<UserModels />} />

              <Route path="*" element={<NoMatch />} />
            </Route>
          </Routes>
        </Us3rAuthProvider>
      </Us3rThreadProvider>
    </Us3rProfileProvider>
  );
}

function Layout() {
  useGAPageView();
  return (
    <AppContainer>
      <Nav />

      <main>
        <Outlet />
      </main>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;

  > main {
    flex-grow: 1;
    margin: 0 auto;
    width: calc(100vw - 300px);
    max-width: 1300px;
  }
`;
