 using System;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TallyJ.Code.Enumerations;
using TallyJ.EF;
using TallyJ.Models;
using Tests.Support;

namespace Tests.BusinessTests
{
  [TestClass]
  public class BallotAnalysisTests
  {
    private Fakes _fakes;

    [TestInitialize]
    public void Init()
    {
      _fakes = new Fakes();
    }

    private List<Person> SamplePeople
    {
      get
      {
        return new List<Person>
                 {
                   new Person{ PersonGuid=Guid.NewGuid()},
                   new Person{ PersonGuid=Guid.NewGuid()},
                   new Person{ PersonGuid=Guid.NewGuid()},
                   new Person{ PersonGuid=Guid.NewGuid()},
                   new Person{ PersonGuid=Guid.NewGuid()},
                 };
      }
    }

    [TestMethod]
    public void CorrectNumberOfVotes_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(null, votes, out newStatus).ShouldEqual(true);

      newStatus.ShouldEqual(BallotStatusEnum.Ok);
    }

    [TestMethod]
    public void TooManyNumberOfVotes_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(null, votes, out newStatus).ShouldEqual(true);

      newStatus.ShouldEqual(BallotStatusEnum.TooMany);
    }

    [TestMethod]
    public void TooFewNumberOfVotes_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(null, votes, out newStatus).ShouldEqual(true);

      newStatus.ShouldEqual(BallotStatusEnum.TooFew);
    }


    [TestMethod]
    public void TooFewNumberOfVotesWithBlank_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {VoteInvalidReasonGuid = VoteHelper.IneligibleReason.BlankVote},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(null, votes, out newStatus).ShouldEqual(true);

      newStatus.ShouldEqual(BallotStatusEnum.TooFew);
    }


    [TestMethod]
    public void KeepReviewStatus_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(BallotStatusEnum.Review, votes, out newStatus).ShouldEqual(false);
      newStatus.ShouldEqual(BallotStatusEnum.Review);


      votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };

      model.DetermineStatusFromVotesList(BallotStatusEnum.Review, votes, out newStatus).ShouldEqual(false);
      newStatus.ShouldEqual(BallotStatusEnum.Review);
    }

    [TestMethod]
    public void HasDuplicates_Test()
    {
      var dupPersonGuid = Guid.NewGuid();

      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = dupPersonGuid},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                      new vVoteInfo {PersonGuid = dupPersonGuid},
                    };

      var model = new BallotAnalyzer(5, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(BallotStatusEnum.Ok, votes, out newStatus).ShouldEqual(true);

      newStatus.ShouldEqual(BallotStatusEnum.Dup);
    }

    [TestMethod]
    public void AllSpoiled_Test()
    {
      var dupPersonGuid = Guid.NewGuid();

      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {VoteInvalidReasonGuid = Guid.NewGuid()},
                      new vVoteInfo {VoteInvalidReasonGuid = Guid.NewGuid()},
                      new vVoteInfo {VoteInvalidReasonGuid = Guid.NewGuid()},
                    };

      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;
      model.DetermineStatusFromVotesList(BallotStatusEnum.Ok, votes, out newStatus).ShouldEqual(false);

      newStatus.ShouldEqual(BallotStatusEnum.Ok);
    }

    [TestMethod]
    public void HasDuplicates2_KeepStatusCode_Test()
    {
      var votes = new List<vVoteInfo>
                    {
                      new vVoteInfo {PersonGuid = Guid.NewGuid()},
                    };


      var model = new BallotAnalyzer(3, _fakes.SaveChanges, false);

      string newStatus;

      // keep Review
      model.DetermineStatusFromVotesList(BallotStatusEnum.Review, votes, out newStatus).ShouldEqual(false);
      newStatus.ShouldEqual(BallotStatusEnum.Review);

      // override OK
      model.DetermineStatusFromVotesList(BallotStatusEnum.Ok, votes, out newStatus).ShouldEqual(true);
      newStatus.ShouldEqual(BallotStatusEnum.TooFew);
    }

    internal class Fakes
    {
      private int _saveChanges;

      public int CountOfCallsToSaveChanges
      {
        get { return _saveChanges; }
        set { _saveChanges = value; }
      }

      public int SaveChanges()
      {
        _saveChanges++;

        return 0;
      }
    }

  }
}