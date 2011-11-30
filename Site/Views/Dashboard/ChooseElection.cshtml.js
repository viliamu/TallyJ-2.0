﻿/// <reference path="../../Scripts/site.js" />
/// <reference path="../../Scripts/jquery-1.7-vsdoc.js" />

var HomeIndexPage = function () {
    var localSettings = {
    };

    var preparePage = function () {
        $(document).on('click', '.btnSelectElection', null, selectElection);
        $(document).on('click', '.btnCopyElection', null, copyElection);
        $(document).on('click', '.btnSelectLocation', null, selectLocation);
        $(document).on('click', '#btnCreate', null, createElection);
        showElections(publicInterface.elections);
    };

    var showElections = function (info) {
        $.each(info, function () {
            if (this.Locations) {
                this.Locations = site.templates.LocationSelectItem.filledWithEach(this.Locations);
            }
        });
        $('#ElectionList').html(site.templates.ElectionListItem.filledWithEach(info));
    };

    var selectElection = function () {
        var btn = $(this);
        var row = btn.parents('.Election');
        var form =
        {
            guid: row.data('guid')
        };

        ShowStatusDisplay("Selecting election and getting locations...");

        CallAjaxHandler(publicInterface.electionsUrl + '/SelectElection', form, afterSelectElection, row);
    };

    var afterSelectElection = function (info, row) {
        if (info.Pulse) {
            ProcessPulseResult(info.Pulse);
        }

        if (info.Selected) {
            $('.Election.true').removeClass('true');
            row.addClass('true');

            $('.CurrentElectionName').text(info.ElectionName);
            $('.CurrentLocationName').text('[No location selected]');

            showLocations(info.Locations, row);

            site.heartbeatActive = true;
            ActivateHeartbeat(true);
        }

    };

    var showLocations = function (list, row) {
        var host = row.find('.Locations');
        host.html(site.templates.LocationSelectItem.filledWithEach(list));
    };

    var selectLocation = function () {
        var btn = $(this);
        var form =
        {
            id: btn.data('id')
        };
        
        ShowStatusDisplay('Selecting location...');
        
        CallAjaxHandler(publicInterface.electionsUrl + '/SelectLocation', form, afterSelectLocation);
    };

    var afterSelectLocation = function (info) {
        if (info.Selected) {
            location.href = site.rootUrl + 'Dashboard';
            return;
        }
    };

    var createElection = function () {
        // get the server to make an election, then go see it
        CallAjaxHandler(publicInterface.electionsUrl + '/CreateElection', null, function (info) {
            //var row = $(site.templates.ElectionListItem.filledWith(info.Election)).prependTo($('#ElectionList'));
            //afterSelectElection(info, row);
            if (info.Success) {
                location.href = site.rootUrl + 'Setup';
                return;
            }
        });
    };

    var copyElection = function () {

        var btn = $(this);
        var form =
        {
            guid: btn.parents('.Election').data('guid')
        };

        if (!confirm('Are you sure you want to make a new election based on this one?')) {
            return;
        }

        CallAjaxHandler(publicInterface.electionsUrl + '/CopyElection', form, function (info) {

            if (info.Success) {
                location.href = '.';
                return;
            }

            alert(info.Message);

            site.heartbeatActive = true;
            ActivateHeartbeat(true);
        });
    };
    var publicInterface = {
        elections: [],
        electionsUrl: '',
        PreparePage: preparePage
    };

    return publicInterface;
};

var chooseElectionPage = HomeIndexPage();

$(function () {
    chooseElectionPage.PreparePage();
});