using Microsoft.AspNet.SignalR;
using System;
using TallyJ.Code.Helpers;
using TallyJ.Code.Session;
using TallyJ.EF;

namespace TallyJ.CoreModels.Hubs
{
  public class ImportHub : IStatusUpdateHub
  {
    private IHubContext _coreHub;

    private string HubNameForPublic
    {
      get {
        return "Import" + UserSession.LoginId;
      }
    }

    private IHubContext CoreHub
    {
      get { return _coreHub ?? (_coreHub = GlobalHost.ConnectionManager.GetHubContext<ImportHubCore>()); }
    }

    /// <summary>
    ///   Join this connection into the hub
    /// </summary>
    /// <param name="connectionId"></param>
    public void Join(string connectionId)
    {
      CoreHub.Groups.Add(connectionId, HubNameForPublic);
    }

    public void ImportInfo(int linesProcessed, int peopleAdded)
    {
      CoreHub.Clients.Group(HubNameForPublic).ImportInfo(linesProcessed, peopleAdded);
    }

    public void StatusUpdate(string msg, bool msgIsTemp = false)
    {
      CoreHub.Clients.Group(HubNameForPublic).LoaderStatus(msg, msgIsTemp);
    }
  }

  public class ImportHubCore : Hub
  {
    // empty class needed for signalR use!!
    // referenced by helper and in JavaScript
  }
}