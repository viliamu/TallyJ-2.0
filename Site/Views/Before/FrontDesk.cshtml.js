﻿/// <reference path="../../Scripts/site.js" />
/// <reference path="../../Scripts/PeopleHelper.js" />
/// <reference path="../../Scripts/jquery-1.7.1.js" />

var FrontDeskPage = function () {
    var local = {
        currentSearch: '',
        currentTop: 0,
        lastSearch: 0,
        timer: null
    };
    var preparePage = function () {
        $('#Main').on('click', '.Btn', voteBtnClicked);

        $(document).keydown(keyDown);

        setTimeout(function () {
            $('html, body').animate({ scrollTop: 0 }, 0);
        }, 100);
    };
    var keyDown = function (ev) {
        var key = ev.which;
        var letter = String.fromCharCode(key);
        var doSearch = false;

        if (/[A-Z]/.test(letter)) {
            local.currentSearch = local.currentSearch + letter.toLowerCase();
            doSearch = true;
            clearTimeout(local.timer);
        }

        switch (key) {
            case 27: // esc
                local.currentSearch = '';
                ev.preventDefault();
                break;
            default:
                //LogMessage(key);
                break;
        }
        if (doSearch) {
            //LogMessage(local.currentSearch);
            applyFilter();
            local.timer = setTimeout(resetSearch, 1200);
        }
    };
    var resetSearch = function () {
        local.currentSearch = '';
        local.currentTop = 0;
        $('#search').fadeOut();
    };
    var applyFilter = function () {
        $('#search').fadeIn().text(local.currentSearch);

        var matches = $('.Voter[data-name^="{0}"]'.filledWith(local.currentSearch.toLowerCase()));
        if (!matches.length) return;
        var desired = matches.offset().top - 20;

        if (desired == local.currentTop) {
            return;
        }

        $('html, body').animate({ scrollTop: desired }, 150);

        local.currentTop = desired;

        matches.animate({ backgroundColor: '#ffff99' }, {
            duration: 600,
            complete: function () {
                $(this).animate({ backgroundColor: '#efeeef' }, {
                    duration: 500,
                    complate: function () {
                        $(this).stop();
                    }
                });
            }
        });
    };
    var voteBtnClicked = function (ev) {
        var btn = $(ev.target);
        var row = btn.parent();
        var pid = row.attr('id').substr(1);

        var btnType = btn.hasClass('InPerson') ? 'P'
            : btn.hasClass('DroppedOff') ? 'D' : 'M';


        var form = {
            id: pid,
            type: btnType,
            last: publicInterface.lastRowVersion || 0
        };

        ShowStatusDisplay("Saving...");
        CallAjaxHandler(publicInterface.controllerUrl + '/RegisterVote', form, updatePeople, pid);
    };

    var updatePeople = function (info, pid) {
        ResetStatusDisplay();
        if (info) {
            if (info.PersonLines) {
                $.each(info.PersonLines, function () {
                    var selector = '#P' + this.PersonId;
                    $(selector).replaceWith(site.templates.FrontDeskLine.filledWith(this));
                    if (this.PersonId != pid) {
                        $(selector).effect('highlight', {}, 2000);
                    }
                });
            }
            if (info.LastRowVersion) {
                publicInterface.lastRowVersion = info.LastRowVersion;
            }
        }
    };

    var publicInterface = {
        controllerUrl: '',
        lastRowVersion: 0,
        PreparePage: preparePage,
        local: local
    };
    return publicInterface;
};

var frontDeskPage = FrontDeskPage();

$(function () {
    frontDeskPage.PreparePage();
});