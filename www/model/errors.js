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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var OutlineError = /** @class */ (function (_super) {
    __extends(OutlineError, _super);
    function OutlineError(message) {
        var _newTarget = this.constructor;
        var _this = 
        // ref:
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        _super.call(this, message) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = _newTarget.name;
        return _this;
    }
    return OutlineError;
}(Error));
exports.OutlineError = OutlineError;
var ServerAlreadyAdded = /** @class */ (function (_super) {
    __extends(ServerAlreadyAdded, _super);
    function ServerAlreadyAdded(server) {
        var _this = _super.call(this) || this;
        _this.server = server;
        return _this;
    }
    return ServerAlreadyAdded;
}(OutlineError));
exports.ServerAlreadyAdded = ServerAlreadyAdded;
var ServerIncompatible = /** @class */ (function (_super) {
    __extends(ServerIncompatible, _super);
    function ServerIncompatible(message) {
        return _super.call(this, message) || this;
    }
    return ServerIncompatible;
}(OutlineError));
exports.ServerIncompatible = ServerIncompatible;
var ServerUrlInvalid = /** @class */ (function (_super) {
    __extends(ServerUrlInvalid, _super);
    function ServerUrlInvalid(message) {
        return _super.call(this, message) || this;
    }
    return ServerUrlInvalid;
}(OutlineError));
exports.ServerUrlInvalid = ServerUrlInvalid;
var OperationTimedOut = /** @class */ (function (_super) {
    __extends(OperationTimedOut, _super);
    function OperationTimedOut(timeoutMs, operationName) {
        var _this = _super.call(this) || this;
        _this.timeoutMs = timeoutMs;
        _this.operationName = operationName;
        return _this;
    }
    return OperationTimedOut;
}(OutlineError));
exports.OperationTimedOut = OperationTimedOut;
var FeedbackSubmissionError = /** @class */ (function (_super) {
    __extends(FeedbackSubmissionError, _super);
    function FeedbackSubmissionError() {
        return _super.call(this) || this;
    }
    return FeedbackSubmissionError;
}(OutlineError));
exports.FeedbackSubmissionError = FeedbackSubmissionError;
// Error thrown by "native" code.
//
// Must be kept in sync with its Cordova doppelganger:
//   cordova-plugin-outline/outlinePlugin.js
//
// TODO: Rename this class, "plugin" is a poor name since the Electron apps do not have plugins.
var OutlinePluginError = /** @class */ (function (_super) {
    __extends(OutlinePluginError, _super);
    function OutlinePluginError(errorCode) {
        var _this = _super.call(this) || this;
        _this.errorCode = errorCode;
        return _this;
    }
    return OutlinePluginError;
}(OutlineError));
exports.OutlinePluginError = OutlinePluginError;
// Marker class for errors originating in native code.
// Bifurcates into two subclasses:
//  - "expected" errors originating in native code, e.g. incorrect password
//  - "unexpected" errors originating in native code, e.g. unhandled routing table
var NativeError = /** @class */ (function (_super) {
    __extends(NativeError, _super);
    function NativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NativeError;
}(OutlineError));
exports.NativeError = NativeError;
var RegularNativeError = /** @class */ (function (_super) {
    __extends(RegularNativeError, _super);
    function RegularNativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RegularNativeError;
}(NativeError));
exports.RegularNativeError = RegularNativeError;
var RedFlagNativeError = /** @class */ (function (_super) {
    __extends(RedFlagNativeError, _super);
    function RedFlagNativeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RedFlagNativeError;
}(NativeError));
exports.RedFlagNativeError = RedFlagNativeError;
//////
// "Expected" errors.
//////
var UnexpectedPluginError = /** @class */ (function (_super) {
    __extends(UnexpectedPluginError, _super);
    function UnexpectedPluginError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnexpectedPluginError;
}(RegularNativeError));
exports.UnexpectedPluginError = UnexpectedPluginError;
var VpnPermissionNotGranted = /** @class */ (function (_super) {
    __extends(VpnPermissionNotGranted, _super);
    function VpnPermissionNotGranted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VpnPermissionNotGranted;
}(RegularNativeError));
exports.VpnPermissionNotGranted = VpnPermissionNotGranted;
var InvalidServerCredentials = /** @class */ (function (_super) {
    __extends(InvalidServerCredentials, _super);
    function InvalidServerCredentials() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidServerCredentials;
}(RegularNativeError));
exports.InvalidServerCredentials = InvalidServerCredentials;
var RemoteUdpForwardingDisabled = /** @class */ (function (_super) {
    __extends(RemoteUdpForwardingDisabled, _super);
    function RemoteUdpForwardingDisabled() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RemoteUdpForwardingDisabled;
}(RegularNativeError));
exports.RemoteUdpForwardingDisabled = RemoteUdpForwardingDisabled;
var ServerUnreachable = /** @class */ (function (_super) {
    __extends(ServerUnreachable, _super);
    function ServerUnreachable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ServerUnreachable;
}(RegularNativeError));
exports.ServerUnreachable = ServerUnreachable;
var IllegalServerConfiguration = /** @class */ (function (_super) {
    __extends(IllegalServerConfiguration, _super);
    function IllegalServerConfiguration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IllegalServerConfiguration;
}(RegularNativeError));
exports.IllegalServerConfiguration = IllegalServerConfiguration;
var NoAdminPermissions = /** @class */ (function (_super) {
    __extends(NoAdminPermissions, _super);
    function NoAdminPermissions() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NoAdminPermissions;
}(RegularNativeError));
exports.NoAdminPermissions = NoAdminPermissions;
var SystemConfigurationException = /** @class */ (function (_super) {
    __extends(SystemConfigurationException, _super);
    function SystemConfigurationException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SystemConfigurationException;
}(RegularNativeError));
exports.SystemConfigurationException = SystemConfigurationException;
//////
// Now, "unexpected" errors.
// Use these sparingly beacause each occurrence triggers a Sentry report.
//////
// Windows.
var ShadowsocksStartFailure = /** @class */ (function (_super) {
    __extends(ShadowsocksStartFailure, _super);
    function ShadowsocksStartFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ShadowsocksStartFailure;
}(RedFlagNativeError));
exports.ShadowsocksStartFailure = ShadowsocksStartFailure;
var ConfigureSystemProxyFailure = /** @class */ (function (_super) {
    __extends(ConfigureSystemProxyFailure, _super);
    function ConfigureSystemProxyFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConfigureSystemProxyFailure;
}(RedFlagNativeError));
exports.ConfigureSystemProxyFailure = ConfigureSystemProxyFailure;
var UnsupportedRoutingTable = /** @class */ (function (_super) {
    __extends(UnsupportedRoutingTable, _super);
    function UnsupportedRoutingTable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnsupportedRoutingTable;
}(RedFlagNativeError));
exports.UnsupportedRoutingTable = UnsupportedRoutingTable;
// Used on Android and Apple to indicate that the plugin failed to establish the VPN tunnel.
var VpnStartFailure = /** @class */ (function (_super) {
    __extends(VpnStartFailure, _super);
    function VpnStartFailure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VpnStartFailure;
}(RedFlagNativeError));
exports.VpnStartFailure = VpnStartFailure;
// Converts an ErrorCode - originating in "native" code - to an instance of the relevant
// OutlineError subclass.
// Throws if the error code is not one defined in ErrorCode or is ErrorCode.NO_ERROR.
function fromErrorCode(errorCode) {
    switch (errorCode) {
        case 1 /* UNEXPECTED */:
            return new UnexpectedPluginError();
        case 2 /* VPN_PERMISSION_NOT_GRANTED */:
            return new VpnPermissionNotGranted();
        case 3 /* INVALID_SERVER_CREDENTIALS */:
            return new InvalidServerCredentials();
        case 4 /* UDP_RELAY_NOT_ENABLED */:
            return new RemoteUdpForwardingDisabled();
        case 5 /* SERVER_UNREACHABLE */:
            return new ServerUnreachable();
        case 6 /* VPN_START_FAILURE */:
            return new VpnStartFailure();
        case 7 /* ILLEGAL_SERVER_CONFIGURATION */:
            return new IllegalServerConfiguration();
        case 8 /* SHADOWSOCKS_START_FAILURE */:
            return new ShadowsocksStartFailure();
        case 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */:
            return new ConfigureSystemProxyFailure();
        case 10 /* NO_ADMIN_PERMISSIONS */:
            return new NoAdminPermissions();
        case 11 /* UNSUPPORTED_ROUTING_TABLE */:
            return new UnsupportedRoutingTable();
        case 12 /* SYSTEM_MISCONFIGURED */:
            return new SystemConfigurationException();
        default:
            throw new Error("unknown ErrorCode " + errorCode);
    }
}
exports.fromErrorCode = fromErrorCode;
// Converts a NativeError to an ErrorCode.
// Throws if the error is not a subclass of NativeError.
function toErrorCode(e) {
    if (e instanceof UnexpectedPluginError) {
        return 1 /* UNEXPECTED */;
    }
    else if (e instanceof VpnPermissionNotGranted) {
        return 2 /* VPN_PERMISSION_NOT_GRANTED */;
    }
    else if (e instanceof InvalidServerCredentials) {
        return 3 /* INVALID_SERVER_CREDENTIALS */;
    }
    else if (e instanceof RemoteUdpForwardingDisabled) {
        return 4 /* UDP_RELAY_NOT_ENABLED */;
    }
    else if (e instanceof ServerUnreachable) {
        return 5 /* SERVER_UNREACHABLE */;
    }
    else if (e instanceof VpnStartFailure) {
        return 6 /* VPN_START_FAILURE */;
    }
    else if (e instanceof IllegalServerConfiguration) {
        return 7 /* ILLEGAL_SERVER_CONFIGURATION */;
    }
    else if (e instanceof ShadowsocksStartFailure) {
        return 8 /* SHADOWSOCKS_START_FAILURE */;
    }
    else if (e instanceof ConfigureSystemProxyFailure) {
        return 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */;
    }
    else if (e instanceof UnsupportedRoutingTable) {
        return 11 /* UNSUPPORTED_ROUTING_TABLE */;
    }
    else if (e instanceof NoAdminPermissions) {
        return 10 /* NO_ADMIN_PERMISSIONS */;
    }
    else if (e instanceof SystemConfigurationException) {
        return 12 /* SYSTEM_MISCONFIGURED */;
    }
    throw new Error("unknown NativeError " + e.name);
}
exports.toErrorCode = toErrorCode;
