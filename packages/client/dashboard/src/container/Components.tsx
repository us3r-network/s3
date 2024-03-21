import styled from 'styled-components'
import ChevronRightDouble from '../components/icons/ChevronRightDouble'
import { DOCS_URL } from '../constants'

const pkgs = [
  {
    name: 'Profile',
    desc: 'A data model, based on Ceramic ComposeDB, includes the following information for each user: name, bio, avatar, wallet address list, and user tags.',
    link: DOCS_URL + '?path=/docs/components-profile-introduction--docs',
  },
  {
    name: 'Link',
    desc: 'Link is a data model based on Ceramic ComposeDB. It represents the content of a URL that users can comment on, bookmark, vote on, and rate.',
    link: DOCS_URL + '?path=/docs/components-link-introduction--docs',
  },
]

const guides = [
  {
    title: 'What is Component ?',
    link: DOCS_URL + '?path=/docs/what-is-underglaze--docs',
  },
  {
    title: 'Who is component for ?',
    link: DOCS_URL + '?path=/docs/who-is-underglaze-for--docs',
  },
  {
    title: 'How to use component ?',
    link: DOCS_URL + '?path=/docs/how-to-use-underglaze--docs',
  },
]

export default function Components() {
  return (
    <Box>
      <Banner>
        <BannerHeading>Components</BannerHeading>
        <BannerDesc>
          <li>
            Comprehensive framework, consists of a vast library of React
            components and associated data models.
          </li>
          <li>
            For each model, we provide an SDK for performing CRUD operations on
            this data model.
          </li>
        </BannerDesc>
      </Banner>
      <Pkgs>
        {pkgs.map((pkg) => (
          <Pkg key={pkg.name}>
            <PkgName>{pkg.name}</PkgName>
            <PkgDesc>{pkg.desc}</PkgDesc>
            <PkgLink href={pkg.link} target="_blank">
              View Details
            </PkgLink>
          </Pkg>
        ))}
      </Pkgs>
      <Guides>
        {guides.map((guide) => (
          <Guide href={guide.link} target="_blank" key={guide.link}>
            <GuideTitle>{guide.title}</GuideTitle>
            <ChevronRightDouble />
          </Guide>
        ))}
      </Guides>
    </Box>
  )
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
`

const Banner = styled.div`
  width: 100%;
  height: 300px;

  background: linear-gradient(90deg, #1a1e38 0%, #333265 100.92%);
  mix-blend-mode: normal;
  border-radius: 20px;

  background-image: url('/components-banner.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  box-sizing: border-box;
  padding-left: 60px;
`
const BannerHeading = styled.h1`
  margin: 0;

  font-style: italic;
  font-weight: 700;
  font-size: 34px;
  line-height: 40px;
  color: #ffffff;
  margin-top: 76px;
`
const BannerDesc = styled.ul`
  margin: 0;
  margin-top: 20px;
  padding: 0 0 0 30px;

  font-weight: 500;
  font-size: 18px;
  line-height: 24px;

  color: #ffffff;

  max-width: 810px;
`
const Pkgs = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`
const Pkg = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;

  height: 193px;

  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
`
const PkgName = styled.span`
  font-weight: 700;
  font-size: 18px;
  line-height: 21px;
  color: #ffffff;
`
const PkgDesc = styled.span`
  margin-top: 10px;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;

  color: #718096;
`
const PkgLink = styled.a`
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  isolation: isolate;

  width: 100%;
  height: 48px;
  box-sizing: border-box;

  background: #718096;
  border-radius: 12px;

  font-weight: 500;
  font-size: 16px;

  color: #ffffff;

  &:hover {
    background: rgba(113, 128, 150, 0.5);
  }
`
const Guides = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  box-sizing: border-box;

  padding: 20px;

  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
`
const Guide = styled.a`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 10px;
  box-sizing: border-box;

  height: 64px;

  background: #14171a;
  border-radius: 10px;

  color: #718096;
  &:hover {
    background: rgba(113, 128, 150, 0.5);
    color: #ffffff;
  }
`
const GuideTitle = styled.span`
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`
