pragma solidity ^0.4.11;
contract Simple{
    address User;
    uint256 data;
    uint256 numCandidates;
    uint256 numvoter;
    uint256 numvoted;
    
    struct Candidate {
        address uid;
        uint256 candidate_number;
        string name;
        uint256 num;
        mapping (address => voter) voters;
    }
    
    struct voter {
        address user_address;
        uint256 candidate_number;
        bool voted;
    }
    
    mapping (uint256 => Candidate) candidates;
    mapping (address => voter) votes;

    
    function vote (address user_address, uint256 candidate_number) public {
        candidates[candidate_number].num = candidates[candidate_number].num + 1;
        candidates[candidate_number].voters[user_address].user_address = user_address;
        candidates[candidate_number].voters[user_address].voted = true;
        votes[user_address].voted = true;
        votes[user_address].candidate_number = candidate_number;
        numvoted++;
    }
    
    function addcandidate(address candidate_address, string name) public {
        uint256 candidateID = numCandidates;
        candidateID = numCandidates++;

        candidates[candidateID] = Candidate(candidate_address, candidateID, name, 0);
    }

    function addvoter(address user_address) public {
        uint256 voterID = numvoter;
        voterID = numvoter++;

        votes[user_address] = voter(user_address, 0, false);
    }

    function getcandidatename(address user_address) constant public returns(string){
        uint256 candidateID = votes[user_address].candidate_number;
        if ( votes[user_address].voted == true ){
            return candidates[candidateID].name;
        }else{
            return "";
        }
    }
    
    function getcandidateID(string name) constant public returns(uint256){
        for (uint i = 0; i < numCandidates; i++) {
            if(keccak256(abi.encodePacked(candidates[i].name)) == keccak256(abi.encodePacked(name))){
                return i;
            }
        }
    }
    
    function get_result_vote(address user_address) constant public returns(uint256){
        if (votes[user_address].voted == true){
            return votes[user_address].candidate_number;
        }
    }
        
    function certification(address user_address) constant public returns(bool){
        if (votes[user_address].user_address == user_address){
            return true;
        }
        return false;
    }
    
    function getcandidate() constant public returns(address){
        return candidates[0].uid;
    }
    
    function getNumOfvoted() constant public returns(uint256){
        return numvoted;
    }

    function getNumOfvoter() constant public returns(uint256) {
        return numvoter;
    }
    
    function getNumOfcandidate() constant public returns(uint256) {
        return numCandidates;
    }
}
