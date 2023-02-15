import styled from 'styled-components';
import Back from './icons/Back';

export default function BackBtn({ backAction }: { backAction: () => void }) {
  return (
    <BackBox
      onClick={() => {
        backAction();
      }}
    >
      <Back />
      <span>Back</span>
    </BackBox>
  );
}

const BackBox = styled.div`
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
`;
