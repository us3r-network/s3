import styled from 'styled-components';

export default function NetworkSwitch({
  network,
  networks,
  networkChangeAction,
}: {
  network: string;
  networks: string[];
  networkChangeAction: (n: string) => void;
}) {
  return (
    <NetworkBox>
      {networks.map((item) => {
        return (
          <button
            key={item}
            className={network === item ? 'active' : ''}
            onClick={() => {
              if (network !== item) {
                networkChangeAction(item);
              }
            }}
          >
            {item.toLowerCase()}
          </button>
        );
      })}
    </NetworkBox>
  );
}

const NetworkBox = styled.div`
  width: 204px;
  padding: 1px;
  height: 40px;
  box-sizing: border-box;
  background: #14171a;
  border-radius: 100px;
  display: flex;
  gap: 6px;
  align-items: center;
  border: 1px solid #39424c;

  > button {
    cursor: pointer;
    border: none;
    outline: none;
    width: 100px;
    height: 36px;

    border-radius: 100px;
    background: #14171a;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    font-weight: 400;
    color: #a0aec0;
    text-transform: capitalize;

    &.active {
      background: #718096;
      font-weight: 500;
      color: #14171a;
    }
  }
`;
