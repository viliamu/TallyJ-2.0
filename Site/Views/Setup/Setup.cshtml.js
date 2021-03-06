﻿function SetupIndexPage() {
  var cachedRules = {
    // temporary cache of rules, for the life of this page
  };
  var settings = {
    locationTemplate: '<div><input data-id={C_RowId} type=text value="{Name}">  <span class="ui-icon ui-icon-arrow-2-n-s" title="Drag to sort"></span>     <span class="ui-icon ui-icon-trash" title="Delete this location"></span></div>',
    tellerTemplate: '<div data-id={C_RowId}>{Name} <span class="ui-icon ui-icon-trash" title="Delete this teller name"></span></div>',
    badiDateGetter: null,
    dateKnown: false,
    isJalal13: null
  };

  function preparePage() {

    $(document).on('change keyup', '#ddlType', function (ev) {
      startToAdjustByType(ev);
      $('.showJalal13').toggle($('#ddlType').val() === 'LSA' && $('#ddlMode').val() === 'N');
      getBadiDate();
    });

    $(document).on('change keyup', '#ddlMode', startToAdjustByType);

    $(document).on('click', '#btnSave', saveChanges);
    $(document).on('click', '#btnAddLocation', addLocation);

    $('.Demographics').on('change', '*:input', function () {
      $('#btnSave').addClass('btn-primary');
    });
    $('#locationList').on('change', 'input', function () {
      locationChanged($(this));
    });
    $('#locationList').on('click', '.ui-icon-trash', function () {
      locationChanged($(this).parent().find('input'), true);
    });

    $('#tellersList').on('click', '.ui-icon-trash', deleteTeller);

    $('#btnResetList').click(resetAllCanVote);

    $('#txtDate').on('change', getBadiDate);

    if (Modernizr.inputtypes.date) {
      $('#txtDate').attr('type', 'date');
    } else {
      //$("#txtDate").datepicker({});  //datepicker ui is all messed up.. better to not use it :(
      $('#txtDateTip').show();
    }
    applyValues(publicInterface.Election);
    showLocations(publicInterface.Locations);
    showTellers(publicInterface.Tellers);

    $('.showJalal13').toggle($('#ddlType').val() == 'LSA' && $('#ddlMode').val() === 'N');
    $('#txtName').focus();

    site.qTips.push({ selector: '#qTipLocked', title: 'Election Locked', text: 'The core settings for the election are locked after ballots have been entered.' });
    site.qTips.push({ selector: '#qTipTest', title: 'Testing', text: 'This is just to help you keep your test elections separate. It has no other impact.' });
    site.qTips.push({ selector: '#qTipName', title: 'Election Name', text: 'This is shown at the top of each page, and is included in some reports.' });
    site.qTips.push({ selector: '#qTipConvenor', title: 'Convenor', text: 'What body is responsible for this election?  For local elections, this is typically the Local Spiritual Assembly.' });
    site.qTips.push({ selector: '#qTipDate', title: 'Election Date', text: 'When is this election being held?  Most elections must be held on the day designated by the National Spiritual Assembly.' });
    //    site.qTips.push({ selector: '#qTipDate2', title: 'Choosing a Date', text: 'Date selection may have problems. Try different options, or type the date in the format: yyyy-mm-dd' });
    site.qTips.push({ selector: '#qTipType', title: 'Type of Election', text: 'Choose the type of election. This affects a number of aspects of TallyJ, including how tie-breaks are handled.' });
    site.qTips.push({ selector: '#qTipVariation', title: 'Variation of Election', text: 'Choose the variation for this election. This affects a number of aspects of TallyJ, including how vote spaces will appear on each ballot.' });
    site.qTips.push({ selector: '#qTipNum', title: 'Spaces on Ballot', text: 'This is the number of names that will be written on each ballot paper.' });
    site.qTips.push({ selector: '#qTipNumNext', title: 'Next Highest', text: 'For Unit Conventions only. This is the number of those with the "next highest number of votes" to be reported to the National Spiritual Assembly.' });
    site.qTips.push({ selector: '#qTipCanVote', title: 'Who can vote', text: 'Either "everyone" or "named" individuals. This is dicated by the type of election and can be adjusted per person.' });
    site.qTips.push({ selector: '#qTipCanReceive', title: 'Who can be voted for?', text: 'Either "everyone" or "named" individuals. This is dicated by the type of election and can be adjusted per person.' });
    //site.qTips.push({ selector: '#qTipUpdate', title: 'Update', text: 'This only needs to be clicked if the type of election has been changed.  This does not alter any data entered in the election.' });
    site.qTips.push({ selector: '#qTipShow', title: 'Allow Tellers Access?', text: 'If checked, this election is listed on the TallyJ home page so that other tellers can join in.  Even if turned on, the election will only appear when you, or a registered teller, is logged in and active.' });
    site.qTips.push({ selector: '#qTipShowCalled', title: 'Show "Called In"?', text: 'If checked, a "Called In" button is shown on the front desk to record phoned in votes.' });
    site.qTips.push({ selector: '#qTipAccess', title: 'Access Code', text: 'This is a "pass phrase" that tellers need to supply to join the election.  It can be up to 50 letters long, and can include spaces.  You can change it here any time.  If this is empty, no other teller will be able to join.' });
    site.qTips.push({ selector: '#qTipLocation', title: 'Locations', text: 'If this election is being held simultaneously in multiple locations, sub-units or polling stations, add names for each location here.  For most elections, only one location should be used.  Erase a name to remove it. (Mailed-in ballots are NOT a location.)' });
    site.qTips.push({ selector: '#qTipTellers', title: 'Tellers', text: 'When tellers are using computers for entering ballots or at the Front Desk, they should select their name near the top of that screen. These names can be informal, first names, and will not be included in printed reports.' });
    site.qTips.push({ selector: '#qTipPreBallot', title: 'Pre-Ballot', text: 'If you will not be using the Front Desk and Roll Call pages, only using TallyJ to input the ballots collected, you can hide those pages.' });
    site.qTips.push({ selector: '#qTipMask', title: 'Mask Voting Method', text: 'In the Roll Call, and final Tellers\' Report, show "Envelope" instead of "Mailed In", "Dropped Off" or "Called In."' });
    site.qTips.push({ selector: '#qTipReset', title: 'Reset', text: 'Everyone is updated automatically if the election type is changed. Click to set everyone now. After resetting, apply special eligibility as needed. (Be sure to Save changes before using Reset.)' });
    site.qTips.push({ selector: '#qTipNoteB', title: 'By-election', text: 'Be sure to set the eligibility of each current member of this institution to "On Institution already".' });
    site.qTips.push({ selector: '#qTipNoteT', title: 'Tie-break', text: 'Be sure to set the eligibility of each of the people tied in this tie-break.' });
    site.qTips.push({ selector: '#qTipNoteN', title: 'National Election', text: 'To use the Front Desk and Roll Call pages, be sure to set the eligibilty of each delegate.' });
    //site.qTips.push({ selector: '#qTip', title: '', text: '' });

    $(window).on('beforeunload', function () {
      if ($('#btnSave').hasClass('btn-primary')) {
        return "Changes have been made and not saved.";
      }
    });

    settings.badiDateGetter = BadiDateToday({
      locationIdentification: 3
    });

    getBadiDate();
  };

  //    var resetVoteStatuses = function () {
  //        ShowStatusDisplay('Updaing...');
  //        CallAjaxHandler(publicInterface.controllerUrl + '/ResetInvolvement', null, function () {
  //            ShowStatusSuccess('Done');
  //        });
  //    };

  function getBadiDate() {
    settings.dateKnown = true;
    var dateStr = $('#txtDate').val();
    var dateParts = dateStr.split('-');
    if (dateStr.length != 10 || dateParts.length != 3) {
      return; // expecting 2020-04-21
    }
    settings.isJalal13 = null;
    var d = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);

    d.setHours(12, 0, 0, 0, 0); // noon
    settings.badiDateGetter.refresh({
      currentTime: d,
      onReady: function (di) {
        var startWord = di.frag1 > new Date() ? 'Starting' : 'Started';

        showBadiInfo(di, $('#badiDateBefore'), startWord + ' before sunset? &rarr; ');

        d.setDate(d.getDate() + 1);
        settings.badiDateGetter.refresh({
          currentTime: d,
          onReady: function (di) {
            showBadiInfo(di, $('#badiDateAfter'), startWord + ' after sunset? &rarr; ');
            showMoreBadiInfo(di);
          }
        });
      }
    });
  }
  function showMoreBadiInfo(di) {
    var isFuture = di.frag1 > new Date();
    if (!di.location) {
      di.location = 'your area';
    }
    var msg = di.longitude
      ? 'Sunset in <span class=locationDetail title="{latitude}, {longitude}">{location}</span> ' + (isFuture ? 'will be' : 'was') + ' at {startingSunsetDesc} on the election day.'
      : '';
    $('#badiDateIntro').html(msg.filledWith(di));

    // found 1st Ridvan for an LSA election?
    $('.badiDateName').removeClass('isJalal13');
    var found = !!settings.isJalal13;
    if (found) {
      settings.isJalal13.addClass('isJalal13');
    }
    $('.showJalal13').toggleClass('missing', $('#ddlType').val() === 'LSA' && $('#ddlMode').val() === 'N' && !found);
  }

  function showBadiInfo(di, target, intro) {
    if (di.bMonth == 2 && di.bDay == 13 && $('#ddlType').val() === 'LSA' && $('#ddlMode').val() === 'N') {
      settings.isJalal13 = target;
    }

    var msg = intro + '<span class=badiDateValue>{bDay} {bMonthMeaning} ({bMonthNameAr}) {bYear}</span>';
    target.html(msg.filledWith(di));
  }

  function showLocations(locations) {
    //        if (locations == null) {
    //            $('#locationList').html('[None]');
    //            return;
    //        }

    $('#locationList').html(settings.locationTemplate.filledWithEach(locations));

    setupLocationSortable();
  };

  function showTellers(tellers) {
    //        if (tellers == null) {
    //            $('#tellersList').html('[None]');
    //            return;
    //        }
    if (tellers == null || tellers.length == 0) {
      return;
    }
    $('#tellersList').html(settings.tellerTemplate.filledWithEach(tellers));
  };

  function resetAllCanVote() {

    ShowStatusDisplay("Updating...");
    CallAjaxHandler(publicInterface.controllerUrl + '/ResetInvolvementFlags', null, function (info) {
      ResetStatusDisplay();
    });

  };

  function deleteTeller(ev) {
    ShowStatusDisplay('Deleting...');
    var icon = $(ev.target);
    var targetDiv = $(icon.parent());
    var target = targetDiv.data('id');
    var form = { id: target };
    CallAjaxHandler(GetRootUrl() + 'Dashboard/DeleteTeller', form, function (info) {
      if (info.Deleted) {
        targetDiv.remove();
      }
      else {
        ShowStatusFailed(info.Error);
      }
    });
  };

  function locationChanged(input, deleteThis) {
    var form = {
      id: input.data('id'),
      text: deleteThis ? '' : input.val()
    };
    ShowStatusDisplay("Saving...");
    CallAjaxHandler(publicInterface.controllerUrl + '/EditLocation', form, function (info) {
      if (info.Success) {
        ShowStatusSuccess(info.Status);
      } else {
        ShowStatusFailed(info.Status);
      }

      if (info.Id == 0) {
        input.parent().remove();
        setupLocationSortable();
      } else {
        input.val(info.Text);
        if (info.Id != form.id) {
          input.data('id', info.Id);
        }
      }
    });
  };

  function setupLocationSortable() {
    $('#locationList').sortable({
      handle: '.ui-icon',
      stop: orderChanged,
      axis: 'y',
      containment: 'parent',
      tolerance: 'pointer'
    });

    var multiple = $('#locationList > div').length > 1;
    $('#locationList .ui-icon').toggle(multiple);
  };

  function orderChanged(ev, ui) {
    var ids = [];
    $('#locationList input').each(function () {
      var id = $(this).data('id');
      if (+id < 1) {
        // an item not saved yet!?
      }
      ids.push(id);
    });
    var form = {
      ids: ids
    };
    ShowStatusDisplay("Saving...");
    CallAjaxHandler(publicInterface.controllerUrl + '/SortLocations', form, function (info) {
      ShowStatusSuccess("Saved");
    });
  };

  function addLocation() {
    var location = {
      C_RowId: -1
    };
    var line = $(settings.locationTemplate.filledWith(location));
    line.appendTo('#locationList').find('input').focus();

    setupLocationSortable();
  };

  function applyValues(election) {
    if (election == null) {
      return;
    };

    $('.Demographics :input[data-name]').each(function () {
      var input = $(this);
      var value = election[input.data('name')] || '';
      switch (input.attr('type')) {
        case 'date':
          var dateString = ('' + value).parseJsonDateForInput();
          input.val(dateString);
          break;
        case 'checkbox':
          input.prop('checked', value);
          break;
        default:
          if (input.attr('id') == 'txtDate') {
            value = ('' + value).parseJsonDateForInput();
          }
          input.val(value);
          break;
      }
    });
    $('span[data-name]').each(function () {
      //LogMessage(this.tagName);
      var input = $(this);
      var value = election[input.data('name')] || '';
      input.html(value);
    });

    startToAdjustByType();
  };

  function saveChanges() {
    var form = {
      C_RowId: publicInterface.Election ? publicInterface.Election.C_RowId : 0
    };

    $(':input[data-name]').each(function () {
      var input = $(this);
      var value;
      switch (input.attr('type')) {
        case 'checkbox':
          value = input.prop('checked');
          break;
        default:
          value = input.val();
          break;
      }
      form[input.data('name')] = value;
    });

    ShowStatusDisplay("Saving...");
    CallAjaxHandler(publicInterface.controllerUrl + '/SaveElection', form, function (info) {
      if (info.Election) {
        applyValues(info.Election);
        $('.CurrentElectionName').text(info.displayName);
      }
      $('#btnSave').removeClass('btn-primary');
      ResetStatusDisplay();
      ShowStatusSuccess(info.Status);
    });
  };

  function startToAdjustByType() {

    var type = $('#ddlType').val();
    var mode = $('#ddlMode').val();

    if (type === 'Con') {
      if (mode === "B") {
        mode = "N";
        $("#ddlMode").val("N");
      }
      $("#modeB").attr("disabled", "disabled");
    }
    else {
      $("#modeB").removeAttr("disabled");
    }

    var classes = [];
    if (type === 'NSA') {
      classes.push('NoteN');
    }
    if (mode === 'B') {
      classes.push('NoteB');
    }
    if (mode === 'T') {
      classes.push('NoteT');
    }
    $('#VariationNotice').removeClass().addClass(classes.join(' ')).toggle(classes.length !== 0);

    var combined = type + '.' + mode;
    var cachedRule = cachedRules[combined];
    if (cachedRule) {
      applyRules(cachedRule);
      return;
    }

    var form = {
      type: type,
      mode: mode
    };

    CallAjaxHandler(publicInterface.controllerUrl + '/DetermineRules', form, applyRules, combined);
  };

  function applyRules(info, combined) {
    var setRule = function (target, locked, value) {
      target.prop('disabled', locked);
      target.data('disabled', locked);
      if (locked) {
        target.val(value);
      }
    };

    setRule($('#txtNames'), info.NumLocked, info.Num);
    setRule($('#txtExtras'), info.ExtraLocked, info.Extra);
    setRule($('#ddlCanVote'), info.CanVoteLocked, info.CanVote);
    setRule($('#ddlCanReceive'), info.CanReceiveLocked, info.CanReceive);

    var lockedAfterBallots = publicInterface.hasBallots;
    $('.Demographics select, .Demographics input[type=number]').each(function () {
      var input = $(this);
      if (!input.data('disabled')) {
        input.prop('disabled', lockedAfterBallots);
      }
    });
    if (lockedAfterBallots) {
      $('#qTipLocked').css({ display: 'inline-block' });
    } else {
      $('#qTipLocked').hide();
    }

    cachedRules[combined] = info;
  }

  //  var buildPage = function () {
  //    $('#editArea').html(site.templates.ElectionEditScreen.filledWith(local.Election));
  //  };

  var publicInterface = {
    controllerUrl: '',
    hasBallots: false,
    Election: null,
    Locations: null,
    settings: settings,
    initialRules: function (type, mode, info) {
      var combined = type + '.' + mode;
      cachedRules[combined] = info;
    },
    PreparePage: preparePage
  };

  return publicInterface;
};

var setupIndexPage = SetupIndexPage();

$(function () {
  setupIndexPage.PreparePage();
});