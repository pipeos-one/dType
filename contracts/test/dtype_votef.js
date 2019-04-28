const CT = require('./constants.js');

const VotingFunctions = artifacts.require('VotingFunctions.sol');

contract('voting functions', async (accounts) => {
    let votingfunc;
    const defaultVote = {
        resource: {
            proponent: CT.EMPTY_ADDRESS,
            contractAddress: CT.EMPTY_ADDRESS,
            dataHash: CT.EMPTY_BYTES,
            votingProcessDataHash: CT.EMPTY_BYTES,
            scoreyes: 0,
            scoreno: 0,
        },
        vote: {
            vote: 0,
            voteWeight: 1,
            senderAddress: CT.EMPTY_ADDRESS,
        },
        parameters: {
            importance: 2, // (1,3]
            cutoff: 10, // (importance * 2), 64]
            golive: 5, // [100, 50%*total]
            godead: 30, // [golive*2, total]
        }
    }

    it('deploy', async () => {
        votingfunc = await VotingFunctions.deployed();
    });

    it('inLivePeriod', async () => {
        let vote = JSON.parse(JSON.stringify(defaultVote));

        for(let i = 0; i < vote.parameters.golive - 1; i++) {
            vote = mockvote(vote, true);
            assert.isNotOk(
                await votingfunc.inLivePeriod([vote.resource, vote.vote, vote.parameters]),
                'ups, it is live..'
            );
        }
        vote = mockvote(vote, true);
        assert.isOk(await votingfunc.inLivePeriod([vote.resource, vote.vote, vote.parameters]), 'ups, it is not live..');

        vote = mockvote(vote, false);
        assert.isOk(await votingfunc.inLivePeriod([vote.resource, vote.vote, vote.parameters]), 'ups, it is not live..');
    });

    it('inDeadPeriod', async () => {
        let vote = JSON.parse(JSON.stringify(defaultVote));

        for(let i = 0; i < vote.parameters.golive; i++) {
            vote = mockvote(vote, true);
        }
        for(let i = vote.parameters.golive; i < vote.parameters.godead - 1; i++) {
            vote = mockvote(vote, false);
            assert.isOk(
                await votingfunc.inLivePeriod([vote.resource, vote.vote, vote.parameters]),
                'ups, it is not live..'
            );
        }
        vote = mockvote(vote, true);
        assert.isNotOk(
            await votingfunc.inLivePeriod([vote.resource, vote.vote, vote.parameters]),
            'ups, it is live..'
        );
    });

    it('getInitialScore', async () => {
        let vote = JSON.parse(JSON.stringify(defaultVote));

        for (let i = 0; i < 10; i++) {
            vote = mockvote(vote, true);
            let {scoreyes, scoreno} = await votingfunc.getInitialScore([vote.resource, vote.vote, vote.parameters]);
            assert.sameOrderedMembers([scoreyes.toNumber(), scoreno.toNumber()], [i, 0]);
        }
        for (let i = 0; i < 10; i++) {
            vote = mockvote(vote, false);
            let {scoreyes, scoreno} = await votingfunc.getInitialScore([vote.resource, vote.vote, vote.parameters]);
            assert.sameOrderedMembers([scoreyes.toNumber(), scoreno.toNumber()], [10, i]);
        }
    });

    it('voteTriggeredAction', async () => {
        let triggerAction, actionType;
        let vote = JSON.parse(JSON.stringify(defaultVote));

        vote = mockvotes(vote, 5, 3, true);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [false, 0], `wrong outcome for 5, 3, true`);

        vote = mockvotes(vote, 6, 3, true);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [true, 1], `wrong outcome for 6, 3, true`);

        vote = mockvotes(vote, 7, 3, true);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [false, 0], `wrong outcome for 7, 3, true`);

        vote = mockvotes(vote, 7, 4, false);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [false, 0], `wrong outcome for 7, 4, true`);

        vote = mockvotes(vote, 7, 4, false);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [false, 0], `wrong outcome for 7, 4, true`);

        vote = mockvotes(vote, 7, 14, false);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [true, 0], `wrong outcome for 7, 14, true`);

        vote = mockvotes(vote, 7, 15, false);
        ({triggerAction, actionType} = await votingfunc.voteTriggeredAction([vote.resource, vote.vote, vote.parameters]));
        assert.sameOrderedMembers([triggerAction, actionType.toNumber()], [false, 0], `wrong outcome for 7, 15, true`);
    });
});

function mockvote(vote, choice) {
    vote.vote.vote = choice;
    if (choice === true) {
        vote.resource.scoreyes ++;
    } else {
        vote.resource.scoreno ++;
    }
    return vote;
}

function mockvotes(vote, yesvotes, novotes, lastchoice) {
    vote.vote.vote = lastchoice;
    vote.resource.scoreyes = yesvotes;
    vote.resource.scoreno = novotes;
    return vote;
}
