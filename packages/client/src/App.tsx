import { Routes, Route, Outlet } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Stream from "./container/Stream";
import Profile from "./container/Profile";
import Family from "./container/Family";

import Home from "./container/Home";
import Nav from "./components/Nav";
import NoMatch from "./components/NoMatch";
import { useGAPageView } from "./hooks/useGoogleAnalytics";
import Model from "./container/Model";
import ModelStream from "./container/ModelStream";

dayjs.extend(relativeTime);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path=":network/stream/:streamId" element={<Stream />} />
        <Route path=":network/profile/:did" element={<Profile />} />
        <Route path=":network/family/:familyOrApp" element={<Family />} />

        <Route path="model" element={<Model />} />
        <Route path="model/:streamId" element={<ModelStream />} />

        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
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
