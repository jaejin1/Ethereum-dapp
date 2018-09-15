pragma solidity ^0.4.11;
contract Vote{
    address User;
    uint256 data;
    uint256 numCandidates;
    uint256 numvoter;
    uint256 numvoted;
    
    struct Candidate {
        address uid;
        uint256 num;
        mapping (address => voter) voters;
    }
    
    struct voter {
        address user_address;
        address candidate_address;
        bool voted;
    }
    
    mapping (address => Candidate) candidates;
    mapping (address => voter) votes;

    
    function vote (address user_address, address candidate_address) public {
        candidates[candidate_address].num = candidates[candidate_address].num + 1;
        candidates[candidate_address].voters[user_address].user_address = user_address;
        candidates[candidate_address].voters[user_address].voted = true;
        votes[user_address].voted = true;
        votes[user_address].candidate_address = candidate_address;
        numvoted++;
    }
    
    function addcandidate(address candidate_address) public {
        uint256 candidateID = numCandidates;
        candidateID = numCandidates++;

        candidates[candidate_address] = Candidate(candidate_address, 0);
    }

    function addvoter(address user_address) public {
        uint256 voterID = numvoter;
        voterID = numvoter++;

        votes[user_address] = voter(user_address,user_address, false);
    }
    
    function get_result_vote(address user_address) constant public returns(address){
        if (votes[user_address].voted == true){
            return votes[user_address].candidate_address;
        }
    }
        
    function certification(address user_address) constant public returns(bool){
        if (votes[user_address].user_address == user_address){
            return true;
        }
        return false;
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
