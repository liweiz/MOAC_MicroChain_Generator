import deploySolBase = require("./deploy_sol_contract_wrapper");

interface SolContractKnowledge {
  path: string;
  name: string;
  params: any[];
}

interface ContractKnowledge {
  sol: SolContractKnowledge;
  txHash: string;
  addr: string;
  contract: any;
}

export = (
  rpcEndpoint: string,
  passcode: string,
  fromAddr: string,
  knowledgeOfSolContracts: SolContractKnowledge[]
): Promise<ContractKnowledge[]> => {
  return new Promise<ContractKnowledge[]>((res, rej) => {
    const results: ContractKnowledge[] = [];
    const noOfSols = knowledgeOfSolContracts.length;
    const deploySol = deploySolBase(rpcEndpoint, passcode, fromAddr);

    const deployMemberSol = (currentIndex: number): void => {
      const aSol = knowledgeOfSolContracts[currentIndex];
      deploySol(aSol.path, aSol.name, aSol.params)
        .then((contract: any) => {
          results.push({
            addr: contract.address,
            contract,
            sol: aSol,
            txHash: contract.transactionHash
          });
          const nextIndex = currentIndex + 1;
          if (nextIndex >= noOfSols) {
            res(results);
          } else {
            deployMemberSol(nextIndex);
          }
        })
        .catch((err: Error) => {
          rej(err);
        });

      deployMemberSol(0);
    };
  });
};
