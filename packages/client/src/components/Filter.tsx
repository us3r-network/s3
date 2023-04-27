import styled from "styled-components";
import { TypesReverse } from "../constants";
import { useCallback, useEffect, useState } from "react";
import RadioIcon from "./icons/Radio";
import { shortPubKey } from "../utils/shortPubKey";

export default function Filter({
  domains,
  families,
  filterAction,
}: {
  domains: Array<{ name: string }>;
  families: Array<{ name: string }>;
  filterAction: (data: {
    domains: string[];
    families: string[];
    types: string[];
  }) => void;
}) {
  const [selectDomains, setSelectDomains] = useState<string[]>([]);
  const [selectFamilies, setSelectFamilies] = useState<string[]>([]);
  const [selectTypes, setSelectTypes] = useState<string[]>([]);

  const domainsHandler = useCallback(
    (item: string) => {
      const itemIdx = selectDomains.indexOf(item);
      let data = []
      if (itemIdx === -1) {
        data = ([...selectDomains, item]);
      } else {
        data = ([
          ...selectDomains.slice(0, itemIdx),
          ...selectDomains.slice(itemIdx + 1),
        ]);
      }
      setSelectDomains(data)
      filterAction({
        domains: data,
        families: selectFamilies,
        types: selectTypes.map(item => TypesReverse[item]),
      });
    },
    [filterAction, selectDomains, selectFamilies, selectTypes]
  );

  const familiesHandler = useCallback(
    (item: string) => {
      const itemIdx = selectFamilies.indexOf(item);
      let data = []
      if (itemIdx === -1) {
        data = ([...selectFamilies, item]);
      } else {
        data = ([
          ...selectFamilies.slice(0, itemIdx),
          ...selectFamilies.slice(itemIdx + 1),
        ]);
      }
      setSelectFamilies(data)
      filterAction({
        domains: selectDomains,
        families: data,
        types: selectTypes.map(item => TypesReverse[item]),
      });
    },
    [filterAction, selectFamilies, selectTypes, selectDomains]
  );

  const typesHandler = useCallback(
    (item: string) => {
      const itemIdx = selectTypes.indexOf(item);
      let data = []
      if (itemIdx === -1) {
        data = ([...selectTypes, item]);
      } else {
        data =([
          ...selectTypes.slice(0, itemIdx),
          ...selectTypes.slice(itemIdx + 1),
        ]);
      }
      setSelectTypes(data)
      filterAction({
        domains: selectDomains,
        families: selectFamilies,
        types: data.map(item => TypesReverse[item]),
      });
    },
    [filterAction, selectDomains, selectTypes, selectFamilies]
  );



  // useEffect(() => {
  //   filterAction({
  //     domains: selectDomains,
  //     families: selectFamilies,
  //     types: selectTypes.map(item => TypesReverse[item]),
  //   });
  // }, [mounted, filterAction, selectDomains, selectFamilies, selectTypes]);

  return (
    <FilterWrapper>
      <div>
        <div className="title">domains:</div>
        <div className="tags">
          {domains.slice(0,20).map((item) => {
            const hasSelect = selectDomains.includes(item.name);
            return (
              <button
                key={item.name}
                className={hasSelect ? "active" : ""}
                onClick={() => {
                  domainsHandler(item.name);
                }}
              >
                {item.name.length > 30 ? shortPubKey(item.name, {len: 8, split: '-'}) : item.name}
                {hasSelect && <RadioIcon />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="title"> family:</div>
        <div className="tags">
          {families.slice(0,20).map((item) => {
            const hasSelect = selectFamilies.includes(item.name);
            return (
              <button
                key={item.name}
                className={hasSelect ? "active" : ""}
                onClick={() => {
                  familiesHandler(item.name);
                }}
              >
                {item.name.length > 30 ? shortPubKey(item.name, {len: 8, split: '-'}) : item.name}
                {hasSelect && <RadioIcon />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="title">Type:</div>
        <div className="tags">
          {Object.keys(TypesReverse).map((item) => {
            const hasSelect = selectTypes.includes(item);
            return (
              <button
                key={item}
                className={hasSelect ? "active" : ""}
                onClick={() => {
                  typesHandler(item);
                }}
              >
                {item}
                {hasSelect && <RadioIcon />}
              </button>
            );
          })}
        </div>
      </div>
    </FilterWrapper>
  );
}

const FilterWrapper = styled.div`
  border: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  box-sizing: border-box;
  > div {
    display: flex;

    .title {
      min-width: 100px;
      height: 40px;
      margin-right: 20px;
      font-weight: 400;
      font-size: 16px;
      line-height: 40px;
      color: rgb(116, 128, 148);
    }

    .tags {
      flex: 1 1 0%;
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      gap: 20px;
      flex-flow: wrap;

      button {
        cursor: pointer;
        height: 40px;
        padding: 8px 16px;
        border-radius: 20px;
        display: flex;
        -webkit-box-align: center;
        align-items: center;
        gap: 8px;
        color: rgb(113, 128, 150);
        border-color: rgb(57, 66, 76);
        border: 1px solid rgb(57, 66, 76);
        background-color: rgb(26, 30, 35);

        &.active {
          border-color: #fff;
          color: #fff;
        }
      }
    }
  }
`;
