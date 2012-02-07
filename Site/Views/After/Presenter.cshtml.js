﻿/// <reference path="../../Scripts/site.js" />
/// <reference path="../../Scripts/jquery-1.7-vsdoc.js" />
/// <reference path="../../Scripts/highcharts.js" />

var PresenterPage = function () {
    var settings = {
        rowTemplate: '',
        footTemplate: '',
        invalidsRowTemplate: '',
        refreshTimeout: null,
        chart: null,
        reportHidden: true
    };

    var preparePage = function () {

        $('#btnRefesh').click(function () {
            getReportData();
        });
        $('#btnReturn').click(function () {
            location.href = site.rootUrl + 'Dashboard';
            return false;
        });

        $(window).on('keydown', keyDown);

        var tableBody = $('#mainBody');
        settings.rowTemplate = tableBody.html();
        tableBody.html('');

        var tFoot = $('#mainFoot');
        settings.footTemplate = tFoot.html();
        tFoot.html('');

        setTimeout(function () {
            getReportData();
        }, 0);
    };

    var getReportData = function () {
        ShowStatusDisplay('Getting results...', 0);
        clearTimeout(settings.refreshTimeout);
        CallAjaxHandler(publicInterface.controllerUrl + '/GetReport', null, showInfo);
    };

    var showInfo = function (info) {
        var votesTable = $('table.Main');

        ResetStatusDisplay();

        if (info.Status != 'Report') {
            $('#Results').hide();
            $('#Wait').show();
            $('#Status').text(info.StatusText);

            settings.refreshTimeout = setTimeout(function () {
                getReportData();
            }, 30000);

            return;
        }

        settings.reportHidden = true;

        $('.Holder').hide();
        $('#Results').show();
        $('#Wait').hide();

        if (info.ReportVotes) {

            votesTable.show();

            $('#mainBody').html(settings.rowTemplate.filledWithEach(expand(info)));


            //            setTimeout(function () {
            //                $('#chart').show();
            //                showChart(info.ChartVotes);
            //            }, 100);
        }
        else {
        }

        $('#totalCounts').find('span[data-name]').each(function () {
            var span = $(this);
            var value = info[span.data('name')];
            span.text(value);
        });

    };

    var keyDown = function (ev) {
        switch (ev.which) {
            case 66: // B
            case 98: // b
            case 27: // esc
                if (!settings.reportHidden) {
                    $('.Holder').fadeOut();
                    settings.reportHidden = true;
                }
                break;

            case 32: // space
                if (settings.reportHidden) {
                    $('.Ready').fadeOut(500, null, function () {
                        $('.Holder').fadeIn(3000);
                    });
                    settings.reportHidden = false;
                }
                break;

            default:
                LogMessage(ev.which);
                break;
        }
    };

    var showChart = function (info) {
        var maxToShow = 10; //TODO what is good limit?

        var getVoteCounts = function () {
            return $.map(info.slice(0, maxToShow), function (item, i) {
                return item.VoteCount;
            });
        };

        var getNames = function () {
            return $.map(info.slice(0, maxToShow), function (item, i) {
                return item.Rank;
            });
        };


        settings.chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chart',
                type: 'bar'
            },
            title: {
                text: 'Top Vote Counts'
            },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: getNames()
            },
            yAxis: {
                title: {
                    text: 'Votes'
                }
            },
            series: [{
                name: 'Votes',
                data: getVoteCounts()
            }]
        });
    };

    var expandInvalids = function (needReview) {
        $.each(needReview, function () {
            this.Ballot = '<a href="../Ballots?l={LocationId}&b={BallotId}">{Ballot}</a>'.filledWith(this);
            this.Link = this.PositionOnBallot;
        });
        return needReview;
    };

    var expand = function (info) {
        var results = info.ReportVotes;
        var foundExtra = false;

        $.each(results, function (i) {
            this.ClassName = this.Section == 'E' ? (foundExtra ? 'Extra' : ' FirstExtra') : '';
            this.VoteDisplay = this.VoteCount + (this.TieBreakCount ? ', ' + this.TieBreakCount : '');
            if (this.Section == 'E') {
                foundExtra = true;
            }
        });
        return results;
    };

    var publicInterface = {
        controllerUrl: '',
        PreparePage: preparePage
    };

    return publicInterface;
};

var presenterPage = PresenterPage();

$(function () {
    presenterPage.PreparePage();
});