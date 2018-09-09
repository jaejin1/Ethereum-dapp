pragma solidity ^0.4.11;
contract Simple{
    
    uint256 data;
    uint256 numCandidates;
    
    struct Candidate {
        
        address user_address;
        bool doesExist; 
    }
    
    mapping (address => Candidate) candidates;

    function get() constant public returns(uint256) {
        return data+1;
    }
    function set (uint256 _data) public{
        data= _data;
    }
    
    function addCandidate(address user_address) public {
        uint256 candidateID = numCandidates;
        candidateID = numCandidates++;
        
        candidates[user_address] = Candidate(user_address, false);
    }

    function certification(address user_address) constant public returns(bool){
        if (candidates[user_address].user_address == user_address){
            return true;
        }
        return false;
    }    

    function getNumOfCandidates() constant public returns(uint256) {
        return numCandidates;
    }
}
