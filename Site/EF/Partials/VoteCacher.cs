using System.Linq;
using TallyJ.Code.Session;

namespace TallyJ.EF
{
  public class VoteCacher : CacherBase<Vote>
  {
    protected override IQueryable<Vote> MainQuery()
    {
      return CurrentDb.Vote
        .Join(CurrentDb.Ballot, v => v.BallotGuid, b => b.BallotGuid, (v, b) => new { v, b })
        .Join(CurrentDb.Location.Where(l => l.ElectionGuid == UserSession.CurrentElectionGuid), g => g.b.LocationGuid,
          l => l.LocationGuid, (g, l) => g.v);
    }
  }
}