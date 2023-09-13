import { useAccount, useNetwork, usePrepareContractWrite, useSwitchNetwork } from 'wagmi'
import { useEffect, useState, useMemo } from 'react'
import clsx from 'clsx'

import { useContractWrite, erc20ABI } from 'wagmi';
import {
  AxelarQueryAPI,
  AxelarAssetTransfer,
  CHAINS,
  Environment,
} from "@axelar-network/axelarjs-sdk";

import { useMetaMask } from '@/utils/hooks/useMetaMask';


const sdk = new AxelarAssetTransfer({
  environment: Environment.TESTNET
});

const DonateBtn = ({ donateTo, amount, source, destination }: { donateTo: `0x${string}`, amount: string, source: any, destination: any }) => {
  const { wallet, hasProvider, connectMetaMask } = useMetaMask();
  const { address } = useAccount()
  const { chain } = useNetwork();
  const { chains, isLoading: swichLoading, switchNetwork } = useSwitchNetwork();


  const { data, isLoading, isSuccess, writeAsync } = useContractWrite({
    address: '0x254d06f33bDc5b8ee05b2ea472107E300226659A',
    abi: erc20ABI,
    chainId: chain?.id,
    functionName: 'transfer',
  })

  const handleDonate = async () => {
    console.log(123)
    const fromChain = CHAINS.TESTNET.ETHEREUM,
      toChain = CHAINS.TESTNET.OPTIMISM,
      destinationAddress = donateTo,
      asset = "uausdc";  // denom of asset. See note (2) below

    const depositAddress = await sdk.getDepositAddress({
      fromChain,
      toChain,
      destinationAddress,
      asset
    });
    console.log("this is deposit: ", depositAddress)

    writeAsync({
      args: [
        depositAddress as `0x${string}`,
        BigInt(Math.floor(parseFloat(amount)) * 1e6 || 10e6)
      ]
    })


  }

  const memoBtnText = useMemo(() => {
    if (!hasProvider) {
      return '';
    }
    if (wallet?.accounts?.length > 0) {
      // return `${account.slice(0, 4)}...${account.slice(-5)}`;
      return `Support`;
    }
    return 'Connect MetaMask';
  }, [wallet, hasProvider]);

  const memoBtnAction = useMemo(() => {
    if (!hasProvider) {
      return () => { };
    }
    if (wallet?.accounts?.length > 0) {
      // return `${account.slice(0, 4)}...${account.slice(-5)}`;
      return handleDonate;
    }
    return () => { };
  }, [wallet, hasProvider]);

  return (
    <div className='rounded-full bg-[#d0fb51] h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px] cursor-pointer' onClick={memoBtnAction}>
      {memoBtnText}
    </div>
  );
};

export default function Home() {
  const { address } = useAccount()
  const [donation, setDonation] = useState(0)
  console.log(address)
  return (
    <main
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <div className='w-[350px]  px-[20px] py-[30px] flex flex-col gap-[15px] justify-center items-center border border-gray-300 rounded-lg'>
        <div className='text-[24px] self-start font-semibold'>Donate <span className='text-[#717171]'>0xhardman</span> aUSDC</div>
        <div className='w-full h-[60px] flex justify-center items-center rounded-lg border border-[#d0fb51] bg-[#d0fb5166] gap-4'>
          <div className='text-[50px]'>💵</div>
          x
          {[1, 3, 5].map((v, i) => {
            return <div onClick={() => {
              console.log(v)
              setDonation(v)
            }} key={i} className={clsx(
              donation == v ? 'bg-[#d0fb51] text-white' : 'bg-white text-[#d0fb51]',
              'w-[35px] h-[35px] leading-[35px] rounded-full text-center cursor-pointer'
            )}>{v}</div>
          })}
          <input
            value={donation}
            className='text-center rounded-md w-[35px] h-[35px] border border-[#d0fb51]'
            onChange={(e: any) => setDonation(e.target.value)}
          ></input>
        </div>
        {/* <div className='rounded-full bg-[#d0fb51] h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]'>Support</div> */}
        <DonateBtn donateTo='0xb15115A15d5992A756D003AE74C0b832918fAb75' amount={"1"} source={undefined} destination={undefined} />
      </div>
    </main>
  )
}
