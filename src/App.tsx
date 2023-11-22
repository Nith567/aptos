import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Network, Provider } from "aptos";

const imageStyle = {
  width: '100px',
  height: 'auto', 
  cursor: 'pointer',
};
const ulStyle = {
  listStyleType: 'none',
  padding: 0,
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

const liStyle = {
  marginBottom: '10px',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#fff',
};
interface AddressDataItem {
  address: string;
  count: number;
}

export const provider = new Provider(Network.DEVNET);
export const moduleAddress = "0x8bc5affd5533434f72e2f4b2cb17fc9781f16b5dc4a44d50801bc20e60968e79";

function App() {

  const [clicksNum, setClick] = useState<number>(0);
  const [addressData, setAddressData] = useState<AddressDataItem[]>([]);

  const { account, signAndSubmitTransaction } = useWallet();

  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);

  const fetchCount = async () => {
    if (!account) return [];
    try {
      const ballClicksResource = await provider.getAccountResource(
        account?.address,
        `${moduleAddress}::ballClicks::Counter`,
      );
      setAccountHasList(true);
      const Count = (ballClicksResource as any).data.count;
     const addr= (ballClicksResource as any).data.set_task_event.guid.id.addr
pushData(addr,Count)
      setClick(Count);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };


  const intialiseCount = async () => {
    if (!account) return [];
    setTransactionInProgress(true);

    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::ballClicks::initalize`,
      type_arguments: [],
      arguments: [],
    };
    try {

      const response = await signAndSubmitTransaction(payload);
      await provider.waitForTransaction(response.hash);

      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const pushData = (address: string, count: number) => {
    const existingIndex = addressData.findIndex(item => item.address === address);

    if (existingIndex !== -1) {
      setAddressData(prevData => {
        const newData = [...prevData];
        newData[existingIndex].count = count;
        return newData;
      });
    } 
    else {
      setAddressData(prevData => {
        const newData = [...prevData, { address, count }];
    const updatedData=newData.sort((a, b) => b.count - a.count).slice(0,10)
  localStorage.setItem('topAddresses', JSON.stringify(updatedData));
        return updatedData;
      });
    }
  };

  const addByOne = async () => {

    if (!account) return;
    setTransactionInProgress(true);

    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::ballClicks::incrementer`,
      type_arguments: [],
      arguments: [],
    };

    try {

      const response = await signAndSubmitTransaction(payload);
      await provider.waitForTransaction(response.hash);
      setClick(prevClicksNum => prevClicksNum + 1);
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };


  useEffect(() => {
    const storedAddresses = localStorage.getItem('topAddresses');
    if (storedAddresses) {
      setAddressData(JSON.parse(storedAddresses));
    }
    fetchCount();
  }, [account?.address,clicksNum]);
  return (
    <>
    
    <Layout>
   
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Ball Clicks Dapp</h1>
            Your connected Address: {account?.address}
          </Col>
          <Col span={12} style={{ textAlign: 'right', paddingRight: '200px' }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={intialiseCount}
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
              >
                Initalize Clicks
              </Button>
      
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={4} offset={8}>
            <h2>Your Clicks   :{clicksNum}</h2>
            <img loading="lazy" src="/redball.png" alt="Red Ball" style={imageStyle} onClick={addByOne}/>
            </Col>
            
          </Row>
        )}
      </Spin>
      <h2  style={{margin:"10px"}}>Top 10 Addresses with most clicks :</h2>
        <ul style={ulStyle}>
      {addressData.map((item, index) => (
        <li key={index} style={liStyle}>
          <span style={{ fontWeight: 'bold',textDecorationColor:"InfoText" }}>{item.address}:</span> {item.count}
        </li>
      ))}
    </ul>
    </>
  );
}

export default App;