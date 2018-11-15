"use strict";
// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shadowsocks_config_1 = require("ShadowsocksConfig/shadowsocks_config");
var errors = require("../model/errors");
var events = require("../model/events");
var settings_1 = require("./settings");
// If s is a URL whose fragment contains a Shadowsocks URL then return that Shadowsocks URL,
// otherwise return s.
function unwrapInvite(s) {
    try {
        var url = new URL(s);
        if (url.hash) {
            var decodedFragment = decodeURIComponent(url.hash);
            // Search in the fragment for ss:// for two reasons:
            //  - URL.hash includes the leading # (what).
            //  - When a user opens invite.html#ENCODEDSSURL in their browser, the website (currently)
            //    redirects to invite.html#/en/invite/ENCODEDSSURL. Since copying that redirected URL
            //    seems like a reasonable thing to do, let's support those URLs too.
            var possibleShadowsocksUrl = decodedFragment.substring(decodedFragment.indexOf('ss://'));
            if (new URL(possibleShadowsocksUrl).protocol === 'ss:') {
                return possibleShadowsocksUrl;
            }
        }
    }
    catch (e) {
        // Something wasn't a URL, or it couldn't be decoded - no problem, people put all kinds of
        // crazy things in the clipboard.
    }
    return s;
}
exports.unwrapInvite = unwrapInvite;
var App = /** @class */ (function () {
    function App(eventQueue, serverRepo, rootEl, debugMode, urlInterceptor, clipboard, errorReporter, settings, environmentVars, updater, quitApplication, document) {
        if (document === void 0) { document = window.document; }
        this.eventQueue = eventQueue;
        this.serverRepo = serverRepo;
        this.rootEl = rootEl;
        this.debugMode = debugMode;
        this.clipboard = clipboard;
        this.errorReporter = errorReporter;
        this.settings = settings;
        this.environmentVars = environmentVars;
        this.updater = updater;
        this.quitApplication = quitApplication;
        this.ignoredAccessKeys = {};
        this.serverListEl = rootEl.$.serversView.$.serverList;
        this.feedbackViewEl = rootEl.$.feedbackView;
        this.syncServersToUI();
        this.syncConnectivityStateToServerCards();
        rootEl.$.aboutView.version = environmentVars.APP_VERSION;
        this.localize = this.rootEl.localize.bind(this.rootEl);
        if (urlInterceptor) {
            this.registerUrlInterceptionListener(urlInterceptor);
        }
        else {
            console.warn('no urlInterceptor, ss:// urls will not be intercepted');
        }
        this.clipboard.setListener(this.handleClipboardText.bind(this));
        this.updater.setListener(this.updateDownloaded.bind(this));
        // Register Cordova mobile foreground event to sync server connectivity.
        document.addEventListener('resume', this.syncConnectivityStateToServerCards.bind(this));
        // Register handlers for events fired by Polymer components.
        this.rootEl.addEventListener('PromptAddServerRequested', this.requestPromptAddServer.bind(this));
        this.rootEl.addEventListener('AddServerConfirmationRequested', this.requestAddServerConfirmation.bind(this));
        this.rootEl.addEventListener('AddServerRequested', this.requestAddServer.bind(this));
        this.rootEl.addEventListener('IgnoreServerRequested', this.requestIgnoreServer.bind(this));
        this.rootEl.addEventListener('ConnectPressed', this.connectServer.bind(this));
        this.rootEl.addEventListener('DisconnectPressed', this.disconnectServer.bind(this));
        this.rootEl.addEventListener('ForgetPressed', this.forgetServer.bind(this));
        this.rootEl.addEventListener('RenameRequested', this.renameServer.bind(this));
        this.rootEl.addEventListener('QuitPressed', this.quitApplication.bind(this));
        this.rootEl.addEventListener('AutoConnectDialogDismissed', this.autoConnectDialogDismissed.bind(this));
        this.rootEl.addEventListener('ShowServerRename', this.rootEl.showServerRename.bind(this.rootEl));
        this.feedbackViewEl.$.submitButton.addEventListener('tap', this.submitFeedback.bind(this));
        this.rootEl.addEventListener('PrivacyTermsAcked', this.ackPrivacyTerms.bind(this));
        // Register handlers for events published to our event queue.
        this.eventQueue.subscribe(events.ServerAdded, this.showServerAdded.bind(this));
        this.eventQueue.subscribe(events.ServerForgotten, this.showServerForgotten.bind(this));
        this.eventQueue.subscribe(events.ServerRenamed, this.showServerRenamed.bind(this));
        this.eventQueue.subscribe(events.ServerForgetUndone, this.showServerForgetUndone.bind(this));
        this.eventQueue.subscribe(events.ServerConnected, this.showServerConnected.bind(this));
        this.eventQueue.subscribe(events.ServerDisconnected, this.showServerDisconnected.bind(this));
        this.eventQueue.subscribe(events.ServerReconnecting, this.showServerReconnecting.bind(this));
        this.eventQueue.startPublishing();
        if (!this.arePrivacyTermsAcked()) {
            this.displayPrivacyView();
        }
        this.displayZeroStateUi();
        this.pullClipboardText();
    }
    App.prototype.showLocalizedError = function (e, toastDuration) {
        var _this = this;
        if (toastDuration === void 0) { toastDuration = 10000; }
        var messageKey;
        var messageParams;
        var buttonKey;
        var buttonHandler;
        var buttonLink;
        if (e instanceof errors.VpnPermissionNotGranted) {
            messageKey = 'outline-plugin-error-vpn-permission-not-granted';
        }
        else if (e instanceof errors.InvalidServerCredentials) {
            messageKey = 'outline-plugin-error-invalid-server-credentials';
        }
        else if (e instanceof errors.RemoteUdpForwardingDisabled) {
            messageKey = 'outline-plugin-error-udp-forwarding-not-enabled';
        }
        else if (e instanceof errors.ServerUnreachable) {
            messageKey = 'outline-plugin-error-server-unreachable';
        }
        else if (e instanceof errors.FeedbackSubmissionError) {
            messageKey = 'error-feedback-submission';
        }
        else if (e instanceof errors.ServerUrlInvalid) {
            messageKey = 'error-invalid-access-key';
        }
        else if (e instanceof errors.ServerIncompatible) {
            messageKey = 'error-server-incompatible';
        }
        else if (e instanceof errors.OperationTimedOut) {
            messageKey = 'error-timeout';
        }
        else if (e instanceof errors.ShadowsocksStartFailure && this.isWindows()) {
            // Fall through to `error-unexpected` for other platforms.
            messageKey = 'outline-plugin-error-antivirus';
            buttonKey = 'fix-this';
            buttonLink = 'https://s3.amazonaws.com/outline-vpn/index.html#/en/support/antivirusBlock';
        }
        else if (e instanceof errors.ConfigureSystemProxyFailure) {
            messageKey = 'outline-plugin-error-routing-tables';
            buttonKey = 'feedback-page-title';
            buttonHandler = function () {
                // TODO: Drop-down has no selected item, why not?
                _this.rootEl.changePage('feedback');
            };
        }
        else if (e instanceof errors.NoAdminPermissions) {
            messageKey = 'outline-plugin-error-admin-permissions';
        }
        else if (e instanceof errors.UnsupportedRoutingTable) {
            messageKey = 'outline-plugin-error-unsupported-routing-table';
        }
        else if (e instanceof errors.ServerAlreadyAdded) {
            messageKey = 'error-server-already-added';
            messageParams = ['serverName', e.server.name];
        }
        else {
            messageKey = 'error-unexpected';
        }
        var message = messageParams ? this.localize.apply(this, __spread([messageKey], messageParams)) : this.localize(messageKey);
        // Defer by 500ms so that this toast is shown after any toasts that get shown when any
        // currently-in-flight domain events land (e.g. fake servers added).
        if (this.rootEl && this.rootEl.async) {
            this.rootEl.async(function () {
                _this.rootEl.showToast(message, toastDuration, buttonKey ? _this.localize(buttonKey) : undefined, buttonHandler, buttonLink);
            }, 500);
        }
    };
    App.prototype.pullClipboardText = function () {
        var _this = this;
        this.clipboard.getContents().then(function (text) {
            _this.handleClipboardText(text);
        }, function (e) {
            console.warn('cannot read clipboard, system may lack clipboard support');
        });
    };
    App.prototype.showServerConnected = function (event) {
        console.debug("server " + event.server.id + " connected");
        var card = this.serverListEl.getServerCard(event.server.id);
        card.state = 'CONNECTED';
    };
    App.prototype.showServerDisconnected = function (event) {
        console.debug("server " + event.server.id + " disconnected");
        try {
            this.serverListEl.getServerCard(event.server.id).state = 'DISCONNECTED';
        }
        catch (e) {
            console.warn('server card not found after disconnection event, assuming forgotten');
        }
    };
    App.prototype.showServerReconnecting = function (event) {
        console.debug("server " + event.server.id + " reconnecting");
        var card = this.serverListEl.getServerCard(event.server.id);
        card.state = 'RECONNECTING';
    };
    App.prototype.displayZeroStateUi = function () {
        if (this.rootEl.$.serversView.shouldShowZeroState) {
            this.rootEl.$.addServerView.openAddServerSheet();
        }
    };
    App.prototype.arePrivacyTermsAcked = function () {
        try {
            return this.settings.get(settings_1.SettingsKey.PRIVACY_ACK) === 'true';
        }
        catch (e) {
            console.error("could not read privacy acknowledgement setting, assuming not akcnowledged");
        }
        return false;
    };
    App.prototype.displayPrivacyView = function () {
        this.rootEl.$.serversView.hidden = true;
        this.rootEl.$.privacyView.hidden = false;
    };
    App.prototype.ackPrivacyTerms = function () {
        this.rootEl.$.serversView.hidden = false;
        this.rootEl.$.privacyView.hidden = true;
        this.settings.set(settings_1.SettingsKey.PRIVACY_ACK, 'true');
    };
    App.prototype.handleClipboardText = function (text) {
        // Shorten, sanitise.
        // Note that we always check the text, even if the contents are same as last time, because we
        // keep an in-memory cache of user-ignored access keys.
        text = text.substring(0, 1000).trim();
        try {
            this.confirmAddServer(text, true);
        }
        catch (err) {
            // Don't alert the user; high false positive rate.
        }
    };
    App.prototype.updateDownloaded = function () {
        this.rootEl.showToast(this.localize('update-downloaded'), 60000);
    };
    App.prototype.requestPromptAddServer = function () {
        this.rootEl.promptAddServer();
    };
    // Caches an ignored server access key so we don't prompt the user to add it again.
    App.prototype.requestIgnoreServer = function (event) {
        var accessKey = event.detail.accessKey;
        this.ignoredAccessKeys[accessKey] = true;
    };
    App.prototype.requestAddServer = function (event) {
        try {
            this.serverRepo.add(event.detail.serverConfig);
        }
        catch (err) {
            this.changeToDefaultPage();
            this.showLocalizedError(err);
        }
    };
    App.prototype.requestAddServerConfirmation = function (event) {
        var accessKey = event.detail.accessKey;
        console.debug('Got add server confirmation request from UI');
        try {
            this.confirmAddServer(accessKey);
        }
        catch (err) {
            console.error('Failed to confirm add sever.', err);
            var addServerView = this.rootEl.$.addServerView;
            addServerView.$.accessKeyInput.invalid = true;
        }
    };
    App.prototype.confirmAddServer = function (accessKey, fromClipboard) {
        if (fromClipboard === void 0) { fromClipboard = false; }
        var addServerView = this.rootEl.$.addServerView;
        accessKey = unwrapInvite(accessKey);
        if (fromClipboard && accessKey in this.ignoredAccessKeys) {
            return console.debug('Ignoring access key');
        }
        else if (fromClipboard && addServerView.isAddingServer()) {
            return console.debug('Already adding a server');
        }
        // Expect SHADOWSOCKS_URI.parse to throw on invalid access key; propagate any exception.
        var shadowsocksConfig = null;
        try {
            shadowsocksConfig = shadowsocks_config_1.SHADOWSOCKS_URI.parse(accessKey);
        }
        catch (error) {
            var message = !!error.message ? error.message : 'Failed to parse access key';
            throw new errors.ServerUrlInvalid(message);
        }
        if (shadowsocksConfig.host.isIPv6) {
            throw new errors.ServerIncompatible('Only IPv4 addresses are currently supported');
        }
        var name = shadowsocksConfig.extra.outline ?
            this.localize('server-default-name-outline') :
            shadowsocksConfig.tag.data ? shadowsocksConfig.tag.data :
                this.localize('server-default-name');
        var serverConfig = {
            host: shadowsocksConfig.host.data,
            port: shadowsocksConfig.port.data,
            method: shadowsocksConfig.method.data,
            password: shadowsocksConfig.password.data,
            name: name,
        };
        if (!this.serverRepo.containsServer(serverConfig)) {
            // Only prompt the user to add new servers.
            try {
                addServerView.openAddServerConfirmationSheet(accessKey, serverConfig);
            }
            catch (err) {
                console.error('Failed to open add sever confirmation sheet:', err.message);
                if (!fromClipboard)
                    this.showLocalizedError();
            }
        }
        else if (!fromClipboard) {
            // Display error message if this is not a clipboard add.
            addServerView.close();
            this.showLocalizedError(new errors.ServerAlreadyAdded(this.serverRepo.createServer('', serverConfig, this.eventQueue)));
        }
    };
    App.prototype.forgetServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        var server = this.serverRepo.getById(serverId);
        if (!server) {
            console.error("No server with id " + serverId);
            return this.showLocalizedError();
        }
        var onceNotRunning = server.checkRunning().then(function (isRunning) {
            return isRunning ? _this.disconnectServer(event) : Promise.resolve();
        });
        onceNotRunning.then(function () {
            _this.serverRepo.forget(serverId);
        });
    };
    App.prototype.renameServer = function (event) {
        var serverId = event.detail.serverId;
        var newName = event.detail.newName;
        this.serverRepo.rename(serverId, newName);
    };
    App.prototype.connectServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        if (!serverId) {
            throw new Error("connectServer event had no server ID");
        }
        var server = this.getServerByServerId(serverId);
        var card = this.getCardByServerId(serverId);
        console.log("connecting to server " + serverId);
        card.state = 'CONNECTING';
        server.connect().then(function () {
            card.state = 'CONNECTED';
            console.log("connected to server " + serverId);
            _this.rootEl.showToast(_this.localize('server-connected', 'serverName', server.name));
            _this.maybeShowAutoConnectDialog();
        }, function (e) {
            card.state = 'DISCONNECTED';
            _this.showLocalizedError(e);
            console.error("could not connect to server " + serverId + ": " + e.name);
            if (!(e instanceof errors.RegularNativeError)) {
                _this.errorReporter.report("connection failure: " + e.name, 'connection-failure');
            }
        });
    };
    App.prototype.maybeShowAutoConnectDialog = function () {
        var dismissed = false;
        try {
            dismissed = this.settings.get(settings_1.SettingsKey.AUTO_CONNECT_DIALOG_DISMISSED) === 'true';
        }
        catch (e) {
            console.error("Failed to read auto-connect dialog status, assuming not dismissed: " + e);
        }
        if (!dismissed) {
            this.rootEl.$.serversView.$.autoConnectDialog.show();
        }
    };
    App.prototype.autoConnectDialogDismissed = function () {
        this.settings.set(settings_1.SettingsKey.AUTO_CONNECT_DIALOG_DISMISSED, 'true');
    };
    App.prototype.disconnectServer = function (event) {
        var _this = this;
        var serverId = event.detail.serverId;
        if (!serverId) {
            throw new Error("disconnectServer event had no server ID");
        }
        var server = this.getServerByServerId(serverId);
        var card = this.getCardByServerId(serverId);
        console.log("disconnecting from server " + serverId);
        card.state = 'DISCONNECTING';
        server.disconnect().then(function () {
            card.state = 'DISCONNECTED';
            console.log("disconnected from server " + serverId);
            _this.rootEl.showToast(_this.localize('server-disconnected', 'serverName', server.name));
        }, function (e) {
            card.state = 'CONNECTED';
            _this.showLocalizedError(e);
            console.warn("could not disconnect from server " + serverId + ": " + e.name);
        });
    };
    App.prototype.submitFeedback = function (event) {
        var _this = this;
        var formData = this.feedbackViewEl.getValidatedFormData();
        if (!formData) {
            return;
        }
        var feedback = formData.feedback, category = formData.category, email = formData.email;
        this.rootEl.$.feedbackView.submitting = true;
        this.errorReporter.report(feedback, category, email)
            .then(function () {
            _this.rootEl.$.feedbackView.submitting = false;
            _this.rootEl.$.feedbackView.resetForm();
            _this.changeToDefaultPage();
            _this.rootEl.showToast(_this.rootEl.localize('feedback-thanks'));
        }, function (err) {
            _this.rootEl.$.feedbackView.submitting = false;
            _this.showLocalizedError(new errors.FeedbackSubmissionError());
        });
    };
    // EventQueue event handlers:
    App.prototype.showServerAdded = function (event) {
        var server = event.server;
        console.debug('Server added');
        this.syncServersToUI();
        this.syncServerConnectivityState(server);
        this.changeToDefaultPage();
        this.rootEl.showToast(this.localize('server-added', 'serverName', server.name));
    };
    App.prototype.showServerForgotten = function (event) {
        var _this = this;
        var server = event.server;
        console.debug('Server forgotten');
        this.syncServersToUI();
        this.rootEl.showToast(this.localize('server-forgotten', 'serverName', server.name), 10000, this.localize('undo-button-label'), function () {
            _this.serverRepo.undoForget(server.id);
        });
    };
    App.prototype.showServerForgetUndone = function (event) {
        this.syncServersToUI();
        var server = event.server;
        this.rootEl.showToast(this.localize('server-forgotten-undo', 'serverName', server.name));
    };
    App.prototype.showServerRenamed = function (event) {
        var server = event.server;
        console.debug('Server renamed');
        this.serverListEl.getServerCard(server.id).serverName = server.name;
        this.rootEl.showToast(this.localize('server-rename-complete'));
    };
    // Helpers:
    App.prototype.syncServersToUI = function () {
        this.rootEl.servers = this.serverRepo.getAll();
    };
    App.prototype.syncConnectivityStateToServerCards = function () {
        try {
            for (var _a = __values(this.serverRepo.getAll()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var server = _b.value;
                this.syncServerConnectivityState(server);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _c;
    };
    App.prototype.syncServerConnectivityState = function (server) {
        var _this = this;
        server.checkRunning()
            .then(function (isRunning) {
            var card = _this.serverListEl.getServerCard(server.id);
            if (!isRunning) {
                card.state = 'DISCONNECTED';
                return;
            }
            server.checkReachable().then(function (isReachable) {
                if (isReachable) {
                    card.state = 'CONNECTED';
                }
                else {
                    console.log("Server " + server.id + " reconnecting");
                    card.state = 'RECONNECTING';
                }
            });
        })
            .catch(function (e) {
            console.error('Failed to sync server connectivity state', e);
        });
    };
    App.prototype.registerUrlInterceptionListener = function (urlInterceptor) {
        var _this = this;
        urlInterceptor.registerListener(function (url) {
            if (!url || !unwrapInvite(url).startsWith('ss://')) {
                // This check is necessary to ignore empty and malformed install-referrer URLs in Android
                // while allowing ss:// and invite URLs.
                // TODO: Stop receiving install referrer intents so we can remove this.
                return console.debug("Ignoring intercepted non-shadowsocks url");
            }
            try {
                _this.confirmAddServer(url);
            }
            catch (err) {
                _this.showLocalizedErrorInDefaultPage(err);
            }
        });
    };
    App.prototype.changeToDefaultPage = function () {
        this.rootEl.changePage(this.rootEl.DEFAULT_PAGE);
    };
    // Returns the server having serverId, throws if the server cannot be found.
    App.prototype.getServerByServerId = function (serverId) {
        var server = this.serverRepo.getById(serverId);
        if (!server) {
            throw new Error("could not find server with ID " + serverId);
        }
        return server;
    };
    // Returns the card associated with serverId, throws if no such card exists.
    // See server-list.html.
    App.prototype.getCardByServerId = function (serverId) {
        return this.serverListEl.getServerCard(serverId);
    };
    App.prototype.showLocalizedErrorInDefaultPage = function (err) {
        this.changeToDefaultPage();
        this.showLocalizedError(err);
    };
    App.prototype.isWindows = function () {
        return !('cordova' in window);
    };
    return App;
}());
exports.App = App;
