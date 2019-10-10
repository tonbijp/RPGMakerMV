//========================================
// TF_LayeredMap.js
// Version :0.7.8.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2018 - 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc Upper[☆]tile display like billboard.
 * @author Tonbi@Tobishima-Factory
 * 
 * @param FillWithNeighborTile
 * @type boolean
 * @desc ON(true) | DefaultLowerTile : OFF(false)
 * Fill with neighbor tile.It is function for A3 or A4 tile.
 * @default true
 * 
 * @param DefaultLowerTile
 * @desc If FillWithNorthTile option is OFF, fill with this tile.
 * Start with 0 at upper left A5 to right.
 * @default 16
 * 
 * @param UseLayeredCounter
 * @type boolean
 * @desc ON(true) | Normal : OFF(false)
 * Counter becomes layered.
 * A2 counter tile can layered like billboard.
 *  (HalfMove.js is needed)
 * @default true
 * 
 * @param BillboardPriority
 * @type select
 * @option Put it front
 * @value front
 * @option Put it back
 * @value back
 * @desc Put billboard in front or back.
 * @default back
 * 
 * @param IsA2FullCollision
 * @type boolean
 * @desc Full collision : ON(true) | Closed and inside is accessible : OFF(false)
 * Entire tile on the ground(A2) collision to activate.
 * @default true
 * 
 * @param IsA3UpperOpen
 * @type boolean
 * @desc Open : ON(true) | Close : OFF(false)
 * Remove the south collision of the roof(A3)?
 * @default false
 * 
 * @param IsA4UpperOpen
 * @type boolean
 * @desc Open : ON(true) | Close : OFF(false)
 * Remove the south collision of the wall top(A4)?
 * @default true
 * 
 * 
 * @help
 * Change tile behavior by use no effect option at default.
 * 
 * 1. Set [counter]option for A3・A4 tile.
 *      [○] Behavior like[☆]   ※
 *      [×] Hide only upper tile.
 * 
 * ※ A3, A4 wall tile floor height set automaticaly.
 * 
 * 2. set [☆] to BCDE tile, and set 4 direction setting.
 *      0x0 ↑→←↓ : [☆]  Same as no plugin.
 *      0x1 ↑→←・ : billboard, ↑　←→ pass, ground (for fence)
 *      0x2 ↑→・↓ : billboard, ↑↓　→ pass, ground (left side of fence)┃
 *      0x3 ↑→・・ : billboard, ↑　　→ pass, ground (bottom left)┗
 *      0x4 ↑・←↓ : billboard, ↑↓←　 pass, ground (right)   ┃
 *      0x5 ↑・←・ : billboard, ↑　←　 pass, ground (bottom right)   ┛
 *      0x6 ↑・・↓ : billboard, ↑↓　　 pass, ground (both side)┃┃
 *      0x7 ↑・・・ : billboard, ↑　　　 pass, ground (like bartizan)┗┛
 *      0x8 ・→←↓ : billboard,  all directtion , ground (for bush)
 *      0x9 ・→←・ : billboard,  all directtion , 2nd floor
 *      0xA ・→・↓ : billboard,  all directtion , 3rd floor
 *      0xB ・→・・ : Same as [○] and north half blocked (for lower shelf) (HalfMove.js is needed)
 *      0xC ・・←↓ : Same as 0x1 and south half blocked (for Barrel) (HalfMove.js is needed)
 *      0xD ・・←・ : Same as 0xB and collision is half (for lower tree) (HalfMove.js is needed)
 *      0xE ・・・↓ : Same as 0xC and collision is half  (for chair) (HalfMove.js is needed)
 *      0xF ・・・・ : Same as 0x1 and collision is half (for peg)(HalfMove.js is needed)
 * 
 * Released under the MIT License.
 */
/*:ja
 * @plugindesc 高層[☆]タイルを書き割り風に配置する
 * @author とんび@鳶嶋工房
 * 
 * @param FillWithNeighborTile
 * @type boolean
 * @text 周辺のタイルでの補完
 * @desc 周辺のタイル ON(true) | [補完用タイル番号] : OFF(false)
 * 低層(地面)を北(画面上では上)のタイルで補完するか
 * @default true
 * 
 * @param DefaultLowerTile
 * @text 補完用タイル番号
 * @desc [北のタイルでの補完]がOFFの場合に使うタイル
 * 番号はA5左上を0として右への順。デフォルト:16(草原)
 * @default 16
 * 
 * @param UseLayeredCounter
 * @type boolean
 * @text カウンター回り込み
 * @desc 回り込み : ON(true) | 通常 : OFF(false)
 * A2のカウンターの後ろに回り込めるようにするか
 * (HalfMove.js が必要)
 * @default true
 * 
 * @param BillboardPriority
 * @type select
 * @option 手前
 * @value front
 * @option 奥(デフォルト)
 * @value back
 * @text 奥行き優先度
 * @desc  書き割りの奥・手前配置の設定
 * @default back
 * 
 * @param IsA2FullCollision
 * @type boolean
 * @text タイル全体を通行不可にするか
 * @desc 通行止め : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 地面(A2)のタイル全体を通行不可にするか
 * @default true
 * 
 * @param IsA3UpperOpen
 * @type boolean
 * @text 屋根南を開くか
 * @desc 開く : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 屋根(A3)の南の衝突判定をなくすか
 * @default false
 * 
 * @param IsA4UpperOpen
 * @type boolean
 * @text 壁の上面南を開くか
 * @desc 開く : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 壁の上(A4)の南の衝突判定をなくすか
 * @default true
 * 
 * 
 * @help 
 * RPGツクールMVで未使用の設定で、タイルの重なりが変化します。
 * 
 * 1. A3・A4タイルに[カウンター]を設定
 *      [○] 下を通れる(ほぼ[☆]の状態) ※1
 *      [×] 上部タイルのみ後ろに回り込める
 * 
 * ※1 壁の高さは自動で調整されます。
 * 
 * 2. BCDEタイルに[☆]を指定したあと、通行設定(4方向)
 *      0x0 ↑→←↓ : [☆] 設定、全方向に 通行可(プラグインなしと同じ)
 *      0x1 ↑→←・ : 書き割り、北　西東 通行可、1階 【基本、柵とか】
 *      0x2 ↑→・↓ : 書き割り、北南　東 通行可、1階 （柵の西側とか）┃
 *      0x3 ↑→・・ : 書き割り、北　　東 通行可、1階 （柵の西南とか）┗
 *      0x4 ↑・←↓ : 書き割り、北南西　 通行可、1階 （柵の東側とか）   ┃
 *      0x5 ↑・←・ : 書き割り、北　西　 通行可、1階 （柵の東南とか）   ┛
 *      0x6 ↑・・↓ : 書き割り、北南　　 通行可、1階 （両脇に木とか）┃┃
 *      0x7 ↑・・・ : 書き割り、北　　　 通行可、1階 （張り出し的な）┗┛
 *      0x8 ・→←↓ : 書き割り、全方向に 通行可、1階 （草むらなどに）
 *      0x9 ・→←・ : 書き割り、全方向に 通行可、2階
 *      0xA ・→・↓ : 書き割り、全方向に 通行可、3階
 *      0xB ・→・・ : 地面[○] 設定かつ北半分通行不可 （棚などに）(HalfMove.js が必要)
 *      0xC ・・←↓ : 0x1 と同じだが南半分が通行不可 （机などに）(HalfMove.js が必要)
 *      0xD ・・←・ : 0xB と同じだが北の両脇が通行可 （根元とか）(HalfMove.js が必要)
 *      0xE ・・・↓ : 0xC と同じだが南の両脇が通行可 （椅子とか）(HalfMove.js が必要)
 *      0xF ・・・・ : 0x1 と同じだが南の両脇が通行可 （杭などに）(HalfMove.js が必要)
 * 
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
// flag用定数
const FLAG_NORTH_DIR = 0x08 // 北の通行設定
const FLAG_UPPER = 0x10; // 高層[☆]
const FLAG_COUNTER = 0x80; // カウンター
const MASK_WITHOUT_DIR_UPPER = 0xFFE0; // 方向と高層[☆]を除いたもの用マスク

// 書割り設定
const MASK_ALL_DIR = 0xF; // 通行設定用マスク
const FLOOR2_BOARD = 0x19; // 09 書き割り、全方向に 通行可、2階
const FLOOR3_BOARD = 0x1A; // 10 書き割り、全方向に 通行可、3階

const MASK_UPPER_DIR = 0x1F; // 高層[☆]と通行設定用マスク
const FLOOR1_N_FULL = 0x1B; // 11 棚
const FLOOR1_S_FULL = 0x1C; // 12 机
const FLOOR1_N_HALF = 0x1D; // 13 椅子(北)
const FLOOR1_S_HALF = 0x1E; // 14 椅子(南)
const FLOOR1_S_FLAT = 0x1F; // 15 杭

const AUTOTILE_BLOCK = 48; // オートタイル1ブロック分のパターン数

/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( 'TF_LayeredMap' );
/**
 * 指定したパラメータの真偽値を返す。
 * @param {String} paramName パラメータ名
 * @param {Number} defaultParam 規定値
 * @returns {Boolean}
 */
const getBooleanParam = ( paramName, defaultParam )=>{
    return pluginParams[ paramName ] ? ( pluginParams[ paramName ].toLowerCase() == 'true' ) : defaultParam;
};
/**
 * 指定したパラメータの数値を返す。
 * @param {String} paramName パラメータ名
 * @param {Number} defaultParam 規定値
 * @returns {Number}
 */
const getNumberParam = ( paramName, defaultParam )=>{
    return pluginParams[ paramName ] ? parseInt( pluginParams[ paramName ], 10 ) : defaultParam;
};
/**
 * 指定したパラメータが、指定した値と同じか。
 * @param {String} paramName パラメータ名
 * @param {String} param 比較する値(小文字)
 * @param {Boolean} defaultParam 規定値
 * @returns {Boolean}
 */
const conpairPluginParam = ( paramName, param, defaultParam )=>{
    if( pluginParams[ paramName ] ){
        return pluginParams[ paramName ].toLowerCase() === param;
    }else{
        return defaultParam;
    }
};

const _FillWithNeighborTile = getBooleanParam( 'FillWithNeighborTile', true );
const _defaultLowerTileId = Tilemap.TILE_ID_A5 + getNumberParam( 'DefaultLowerTile', 16 );
const _useLayeredCounter = getBooleanParam( 'UseLayeredCounter', true );
const _BillboardPriority = conpairPluginParam( 'BillboardPriority', 'front', false ) ? Infinity : -Infinity;
const _IsA2FullCollision = getBooleanParam( 'IsA2FullCollision', true );
const _IsA3UpperOpen = getBooleanParam( 'IsA3UpperOpen', false );
const _IsA4UpperOpen = getBooleanParam( 'IsA4UpperOpen', true );


/*---- Game_Interpreter ----*/
/**
 * プラグインコマンドの実行
 */
const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function ( command, args ){
    _Game_Interpreter_pluginCommand.apply( this, arguments );

    // TODO: プラグインコマンドで何か挙動を変えるものがあれば
    //if( command.toUpperCase() !== PLUGIN_COMMAND ) return;

    //_SomeParameter = ( args[0].toLowerCase() === PLUGIN_PARAM_TRUE );
};

 
/*---- ShaderTilemap ----*/
/**
 * タイルセットの画像を設定する。
 * マップ開始時に呼ばれる。
 */
const _ShaderTilemap_refreshTileset = ShaderTilemap.prototype.refreshTileset;
ShaderTilemap.prototype.refreshTileset = function(){
    _ShaderTilemap_refreshTileset.call( this );

    // BitmapをPIXI.Textureにコンバート
    const bitmaps = this.bitmaps.map( function( x ){
        return x._baseTexture ? new PIXI.Texture( x._baseTexture ) : x;
   } );

   // 書き割りのタイルセットの画像をアップデート
   for( let curItem of this.TF_billboards ){
        curItem.children[0].setBitmaps( bitmaps );
   }
}


/**
 * 書き割りレイヤーの生成と追加。
 */
const _ShaderTilemap_createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function(){
    _ShaderTilemap_createLayers.call( this );

    // 書き割り風オブジェクトを生成
    // +3 はスクロールの際にはみ出す部分と2・3階用
    const th = this._tileHeight;
    const tileRows = Math.ceil( this._height / th ) + 3;

    if( !this.hasOwnProperty( 'TF_billboards' ) ){
        this.TF_billboards = [];
    }

    for( let i = 0; i < tileRows; i++ ){
        const billboard = new PIXI.tilemap.ZLayer( this, 3 );
        billboard.spriteId = _BillboardPriority;
        this.addChild( billboard );
        this.TF_billboards.push( billboard );
        const layer = new PIXI.tilemap.CompositeRectTileLayer( 0, [], 0 );
        billboard.addChild( layer );
    }
};

/**
 * 描画前に書き割りの中を空にしておく。
 */
const _ShaderTilemap_paintAllTiles = ShaderTilemap.prototype._paintAllTiles;
ShaderTilemap.prototype._paintAllTiles = function( startX, startY ){
    for( let curItem of this.TF_billboards ){
        curItem.clear();
    }

    _ShaderTilemap_paintAllTiles.apply( this, arguments );
}

/**
 * タイルマップと書き割りの描画。
 * 関数をまるっと書き換えているので
 * 他のプラグインとコンフリクトを起こしてしまうので注意。
 * @param {Number} startX 開始 マップ x座標(タイル数)
 * @param {Number} startY 開始 マップ y座標(タイル数)
 * @param {Number} x 画面上の x座標(タイル数)
 * @param {Number} y 画面上の y座標(タイル数)
 */
ShaderTilemap.prototype._paintTiles = function( startX, startY, x, y ){
    const mx = startX + x; //  描画対象のマップ x座標(タイル数)
    const my = startY + y; //  描画対象のマップ y座標(タイル数)
    const dx = x * this._tileWidth; //  描画位置の x座標(ピクセル)
    const dy = y * this._tileHeight; //  描画位置の y座標(ピクセル)
    const tileId0 = this._readMapData( mx, my, 0 ); // 低層タイルA
    const tileId1 = this._readMapData( mx, my, 1 ); // 低層タイルA2右側など
    const tileId2 = this._readMapData( mx, my, 2 ); // B 〜 E タイル
    const tileId3 = this._readMapData( mx, my, 3 ); // B 〜 E タイル
    const shadowBits = this._readMapData( mx, my, 4 ); // 影ペン
    const northTileId1 = this._readMapData( mx, my - 1, 1 ); // 北位置の低層タイルA
    const lowerLayer = this.lowerLayer.children[ 0 ];     // 低層レイヤ( z: 0 )
    const upperLayer = this.upperLayer.children[ 0 ];   // 高層レイヤ( z: 4 )

    /**
     * タイルを描画(upperLayer,lowerLayer,dx,dy は親の変数を使う)
     * @param {Number} tileId タイルID
     */
    const drawTile = ( tileId ) => {
        if ( !this._isHigherTile( tileId )
        || ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR1_N_FULL
        || ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR1_N_HALF ){
            // 高層タイルではない
            this._drawTile( lowerLayer, tileId, dx, dy );
            return;
        }
        
        // 優先階(priorityFloor)を設定
        let priorityFloor;
        if( ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR2_BOARD ){
            priorityFloor = 2;
        }else if( ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR3_BOARD ){
            priorityFloor = 3;
        }else{
            priorityFloor = 1;
        }

        let floorNumber = 1;
        if( priorityFloor === 2 ||  priorityFloor === 3 ){
            const wallSideType = getWallSideType( this._readMapData( mx, my + 1, 1 ) );
            
            if( wallSideType === 1 ){
                floorNumber = 2; 
            }else if( wallSideType === 2 ){
                floorNumber = 3; 
            }else if( wallSideType === 3 ){
                floorNumber = priorityFloor;
            }else{
                // 壁ではない場合
                floorNumber = priorityFloor;
                // TODO : B〜E タイルのオート位置設定を行う…か?
            }
        }

        if( floorNumber === 2 ){
            // 2階設定は、ひとつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 1 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 2 );

        }else if( floorNumber === 3 ){
            // 3階設定は、ふたつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 2 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 3 );

        }else if( this.flags[ tileId ] & MASK_ALL_DIR ){
            // 通行不可設定のどれかがONだと書き割り
            this._drawTile( this.TF_billboards[ y ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight );

        }else{
            // 全方向通行可の場合は通常の高層[☆]表示
            this._drawTile( upperLayer, tileId, dx, dy );
        }
    }

    drawTile( tileId0 );
    drawTile( tileId1 );

    // 影の描画
    this._drawShadow( lowerLayer, shadowBits, dx, dy );

    // テーブルの描画
    if ( this._isTableTile( northTileId1 ) && !this._isTableTile( tileId1 ) ){
        if ( !Tilemap.isShadowingTile( tileId0 ) ){
            this._drawTableEdge( lowerLayer, northTileId1, dx, dy );
        }
    }

    // 立体交差の描画
    if ( this._isOverpassPosition( mx, my ) ){
        this._drawTile( upperLayer, tileId2, dx, dy );
        this._drawTile( upperLayer, tileId3, dx, dy );
    } else {
        drawTile( tileId2 );
        drawTile( tileId3 );
    }

    /**
     * 指定位置の壁の状態を調べる
     * @param {Number} tileId タイルID
     * @returns {Number}  0:壁ではない, 1:下端, 2:上下に接続した壁, 3:上端
     */
    function getWallSideType( tileId ){
        if( !Tilemap.isWallSideTile( tileId ) ) return 0; // 壁タイルではない

        // autotileShape のビットは 下右上左 に対応しているので、それで判定
        const autotileShape = Tilemap.getAutotileShape( tileId );
        if( autotileShape & 2 ) return 3;
        if( autotileShape & 8 ) return 1;
        return 2;
    }
};

/**
 * (スクロールに合わせて)書き割りの表示位置を変更
 * @param {Number} startX
 * @param {Number} startY
 */
const _ShaderTilemap_updateLayerPositions = ShaderTilemap.prototype._updateLayerPositions;
ShaderTilemap.prototype._updateLayerPositions = function( startX, startY ){
    _ShaderTilemap_updateLayerPositions.apply( this, arguments );

    let ox,oy;
    if (this.roundPixels){
        ox = Math.floor(this.origin.x);
        oy = Math.floor(this.origin.y);
    } else {
        ox = this.origin.x;
        oy = this.origin.y;
    }
    const th = this._tileHeight;
    const tw = this._tileWidth;
    const posX = startX * tw - ox;
    const posY = startY * th - oy
    const l = this.TF_billboards.length;
    for( let i = 0; i < l; i++ ){
        const curItem = this.TF_billboards[ i ];
        curItem.position.x = posX;
        curItem.position.y = posY + ( i + 1) * th;
    };
};

/*---- DataManager ---*/
// オートタイル通行flag
// 通行不可設定 1:下  2:左  4:右  8:上
// 16:高層に表示[☆]
// A2カウンター
const COUNTER_PASS = [
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 28, 28, 28, 28, 
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 28, 28, 28, 28, 28, 15, 15, 
    15, 15, 28, 28, 15, 28, 28, 28, 
];
const AUTO_TILE_EMPTY_PASS = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    2, 2, 2, 2, 8, 8, 8, 8,
    4, 4, 4, 4, 1, 1, 1, 1,
    6, 9, 10, 10, 12, 12, 5, 5,
    3, 3, 14, 11, 7, 13, 15, 15
];

// 屋根 A3 奇数列
const A3_UPPER_PASS =_IsA3UpperOpen ? [
    0, 2, 17, 17, 
    4, 6, 17, 17, 
    0, 2, 17, 17, 
    4, 6, 17, 17, 
] : [
    0, 2, 17, 17, 
    4, 6, 17, 17, 
    1, 3, 17, 17, 
    5, 7, 17, 17, 
];

// 屋根 A3 奇数列(地面)
const A3_BOTTOM_PASS =_IsA3UpperOpen ? [
    0, 2, 8, 10, 
    4, 6, 12, 14, 
    0, 2, 8, 10, 
    4, 6, 12, 14, 
]: [
    0, 2, 8, 10, 
    4, 6, 12, 14, 
    1, 3, 9, 11, 
    5, 7, 13, 15, 
];

// 壁(上面) A4 奇数列
const A4_UPPER_PASS = _IsA4UpperOpen ? [
    0, 2, 4, 6, 0, 2, 4, 6,
    0, 2, 4, 6, 0, 2, 4, 6,
    2, 6, 2, 6, 17, 17, 17, 17,
    4, 4, 6, 6, 0, 2, 4, 6,
    6, 17, 17, 17, 17, 17, 4, 6,
    2, 6, 17, 17, 6, 17, 17, 17
] : [
    0, 2, 4, 6, 0, 2, 4, 6,
    0, 2, 4, 6, 1, 3, 5, 7,
    2, 6, 2, 6, 17, 17, 17, 17,
    4, 4, 6, 6, 1, 3, 5, 7,
    6, 17, 17, 17, 17, 17, 5, 7,
    3, 7, 17, 17, 7, 17, 17, 17
];

// 壁(側面) A3・A4 偶数列 [○]
const WALL_SIDE_PASS_EDGE = [
    15, 15, 17, 17, 
    15, 15, 17, 17, 
    15, 15, 17, 17, 
    15, 15, 17, 17, 
];
// 壁(側面) A3・A4 偶数列[×]
const WALL_SIDE_PASS = [
    25, 25, 26, 26, 
    25, 25, 26, 26, 
    17, 17, 17, 17, 
    17, 17, 17, 17, 
];


/**
 * 読み込み直後に、タイルセットデータを書き換える
 * @param {Object} object 読み込んだデータ
 */
const _DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function( object ){
    _DataManager_onLoad.apply( this, arguments );

    if( object === $dataTilesets ) treatDataTilesets();
    // end: onLoad

    /**
     * カウンター設定しているA2・A3・A4オートタイルを回り込みに設定
     */
    function treatDataTilesets(){
        // 全タイルセットに対して設定
        for( const curTileset of $dataTilesets ){
            if( !curTileset ) continue;
            const flags = curTileset.flags;

            if( _useLayeredCounter ){
                // カウンタータイル(A2)を走査
                for( let tileId = Tilemap.TILE_ID_A2; tileId < Tilemap.TILE_ID_A3; tileId += AUTOTILE_BLOCK ){
                    if( isCounterTile( flags[ tileId ] ) ) counter2UpperLayer( flags, tileId );
                }
            }

            if( !_IsA2FullCollision ){
                // 地面タイル(A2)を走査し[×]判定の中を通行可に変更
                for( let tileId = Tilemap.TILE_ID_A2; tileId < Tilemap.TILE_ID_A3; tileId += AUTOTILE_BLOCK ){
                    if( flags[ tileId + 15 ] & MASK_ALL_DIR  ){
                        ground2Empty( flags, tileId );
                    }
                }
            }

            // 屋根タイル(A3)を走査
            for( let tileId = Tilemap.TILE_ID_A3; tileId < Tilemap.TILE_ID_A4; tileId += AUTOTILE_BLOCK ){
                if( isCounterTile( flags[ tileId ] ) ){
                    if( Tilemap.isRoofTile( tileId ) ){
                        roof2UpperLayer( flags, tileId );
                    }else{
                        wallSide2UpperLayer( flags, tileId );
                    }
                }else if( Tilemap.isRoofTile( tileId ) ){
                    roof2Bottom( flags, tileId );
                }
            }

            // 壁タイル(A4)を走査
            for( let tileId = Tilemap.TILE_ID_A4; tileId < Tilemap.TILE_ID_MAX; tileId += AUTOTILE_BLOCK ){
                if( isCounterTile( flags[ tileId ] ) ){
                    if( Tilemap.isWallTopTile( tileId ) ){
                        wallTop2UpperLayer( flags, tileId );
                    }else{
                        wallSide2UpperLayer( flags, tileId );
                    }
                }else if( !_IsA4UpperOpen && Tilemap.isWallTopTile( tileId ) ){
                    wallTop2Close( flags, tileId );
                }
            }
        }

    }


    // カウンターの通行設定
    function counter2UpperLayer( flags, tileId ){
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i  ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | COUNTER_PASS[ i ];
        }
    }

    // 内側を空にする。
    function ground2Empty( flags, tileId ){
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i  ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | AUTO_TILE_EMPTY_PASS[ i ];
        }
    }
    
    //  屋根の通行設定(カウンターON)
    function roof2UpperLayer( flags, tileId ){
        if( flags[ tileId + 15 ] & MASK_ALL_DIR ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A3_UPPER_PASS[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }

    //  屋根の通行設定(カウンターOFF)
    function roof2Bottom( flags, tileId ){
        if( !( flags[ tileId + 15 ] & MASK_ALL_DIR ) ) return;
        // [×] : 全体を閉じる
        for( let i = 0; i < 16; i++ ){
            flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A3_BOTTOM_PASS[ i ];
        }
    }

    //  壁(上面)の通行設定
    function wallTop2UpperLayer( flags, tileId ){
        if( flags[ tileId + 46 ] & MASK_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i = 0; i < 47; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A4_UPPER_PASS[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可
            for( let i = 0; i < 47; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }
    //  壁(上面)の通行設定(地面)
    function wallTop2Close( flags, tileId ){
        if( !( flags[ tileId + 46 ] & MASK_ALL_DIR  ) ) return;
        // [×] : 全体を閉じる
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | AUTO_TILE_EMPTY_PASS[ i ];
        }
    }

    //  壁(側面)の通行設定
    function wallSide2UpperLayer( flags, tileId ){
        if( flags[ tileId + 15 ] & MASK_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | WALL_SIDE_PASS_EDGE[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可(一番下のみ通行不可)
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | WALL_SIDE_PASS[ i ];
            }
        }
    }
}



/*---- Scene_Map ---*/
/**
 * シーン表示前に、マップデータを書き換える
 */
const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function( ){
    treatDataMap();
    _Scene_Map_onMapLoaded.call( this );
    // end: onMapLoaded

    /**
     * カウンター設定のA3・A4オートタイルの箇所に、低層の補完タイルを設定
     */
    function treatDataMap(){
        for( let y = 0; y < $dataMap.height; y++ ){
            for( let x = 0; x < $dataMap.width; x++ ){
                const tileId = getMapData( x, y, 0 );
                if( !isA3A4Tile( tileId ) ) continue;

                // タイルを補完
                setMapData( x, y, 1, tileId );

                if( _FillWithNeighborTile ){
                    // 北タイルで補完ただし、一番南は南で補完
                    const southTileId = getMapData( x, $gameMap.roundY( y + 1 ) , 0 );
                    if( isA3A4Tile( southTileId ) ){
                        const northTileId = getMapData( x, y - 1, 0 );
                        setMapData( x, y, 0, northTileId === 0 ? _defaultLowerTileId : northTileId );
                    }else{
                        setMapData( x, y, 0, southTileId === 0 ? _defaultLowerTileId : southTileId );
                    }
                } else {
                    // 指定タイルで補完
                    setMapData( x, y, 0, _defaultLowerTileId );
                }
            }
        }

        /**
         * A3・A4タイルか。
         * @param {Number} tileId タイルID
         * @returns {Boolean} 
         */
        function isA3A4Tile( tileId ){
            return ( Tilemap.isTileA3( tileId ) || Tilemap.isTileA4( tileId ) );
        }
        /**
         * 指定位置のタイルIDを返す。
         * @param {Number} x x座標(タイル数)
         * @param {Number} y y座標(タイル数)
         * @param {*} z レイヤー位置
         * @returns {Number} タイルID
         */
        function getMapData( x, y, z ){
            return $dataMap.data[ x + ( $gameMap.roundY( y ) + z * $dataMap.height ) * $dataMap.width ];
        }
        /**
         * マップデータにタイルIDを書き込む。
         * @param {Number} x x座標(タイル数)
         * @param {Number} y y座標(タイル数)
         * @param {Number} z レイヤー位置
         * @param {Number} tileId タイルID
         */
        function setMapData( x, y, z, tileId ){
            $dataMap.data[ x + ( $gameMap.roundY( y ) + z * $dataMap.height ) * $dataMap.width ] = tileId;
        }

    }
}



/*---- Game_CharacterBase ----*/
/**
 * 指定方向への移動が可能か
 * キャラクタ半分の位置が関係するものは、ここで判定。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 移動可能か
 */
const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
Game_CharacterBase.prototype.isMapPassable = function( x, y, d ){
    const intX = Math.floor( x + 0.5 );
    const intY = Math.floor( y + 0.5 );

    // FLOOR1_N_FULL
    if( d === 8 || d === 2 ){
        if(  intY <= y ){
             if( checkCollision( x, $gameMap.roundYWithDirection( y + 0.5, d ), FLOOR1_N_FULL ) ) return false;
             if( 0.5 <= x % 1 ){ // キャラが西位置の場合に一つ東のタイルをチェック
                if( checkCollision( $gameMap.roundX( x + 1 ), $gameMap.roundYWithDirection( y + 0.5, d ), FLOOR1_N_FULL ) ) return false;
             }
        }
    }else if( d === 4 ){
        if( y < intY && checkCollision( $gameMap.roundXWithDirection( x, d ), y + 0.5, FLOOR1_N_FULL ) ) return false;
    }else if( d === 6 ){
        if( y < intY && checkCollision( $gameMap.roundXWithDirection( x + 0.5, d ), y + 0.5, FLOOR1_N_FULL ) ) return false;
    }
    //FLOOR1_S_FULL
    if( d === 8 || d === 2 ){
        if(  y < intY ){
             if( checkCollision( x, $gameMap.roundYWithDirection( y, d ), FLOOR1_S_FULL ) ) return false;
             if( 0.5 <= x % 1 ){ // キャラが西位置の場合に一つ東のタイルをチェック
                if( checkCollision( $gameMap.roundX( x + 1 ), $gameMap.roundYWithDirection( y, d ), FLOOR1_S_FULL ) ) return false;
             }
        }
    }else if( d === 4 ){
        if( intY <= y && checkCollision( $gameMap.roundXWithDirection( x, d ), y, FLOOR1_S_FULL ) ) return false;
    }else if( d === 6 ){
        if( intY <= y && checkCollision( $gameMap.roundXWithDirection( x + 0.5, d ), y, FLOOR1_S_FULL ) ) return false;
    }

    // FLOOR1_N_HALF
    if( d === 8 || d === 2 ){
        if( intX <= x && intY <= y && checkCollision( x, $gameMap.roundYWithDirection( y + 0.5, d ), FLOOR1_N_HALF ) ) return false;
    }else if( d === 4 || d === 6 ){
        if( x < intX && y < intY && checkCollision( $gameMap.roundXWithDirection( x, d ), y + 0.5, FLOOR1_N_HALF ) ) return false;
    }
    // FLOOR1_S_HALF
    if( d === 8 || d === 2 ){
        if( intX <= x && y < intY && checkCollision( x, $gameMap.roundYWithDirection( y, d ), FLOOR1_S_HALF ) ) return false;
    }else if( d === 4 || d === 6 ){
        if( x < intX && intY <= y && checkCollision( $gameMap.roundXWithDirection( x, d ), y, FLOOR1_S_HALF ) ) return false;
    }

    // FLOOR1_S_FLAT
    if( d === 8 ){
        if( intX <= x && y < intY && checkCollision( x, $gameMap.roundYWithDirection( y, d ), FLOOR1_S_FLAT ) ) return false;
    }else if( d === 2 ){
        if( intX <= x && intY <= y && checkCollision( x, y, FLOOR1_S_FLAT ) ) return false;
    }

    return _Game_CharacterBase_isMapPassable.apply( this, arguments );


    /**
     * 指定位置に指定flagがあるか
     * @param {Number} x タイル数
     * @param {Number} y タイル数
     * @param {Number} collisionType 調べるタイルのflag(高層[☆]と通行)
     * @returns {Boolean} 
     */
    function checkCollision( x, y, collisionType ){
        const flags = $gameMap.tilesetFlags();
        const tiles = $gameMap.allTiles( Math.floor( x ), Math.floor( y ) );
        
        for ( let i = 0; i < tiles.length; i++ ){
            if( ( flags[ tiles[ i ] ] & MASK_UPPER_DIR ) === collisionType ) return true;
        }
        return false;
    }
}


/*---- Game_Map ----*/
/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} bit {@link RPG.Tileset}の flagsチェック用ビット
 * @returns {Boolean} 高層表示[☆]の4方向の通行設定については@helpを参照
 */
const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function( x, y, bit ){
    const flags = this.tilesetFlags();
    const tiles = this.allTiles( x, y );
    for ( let i = 0; i < tiles.length; i++ ){
        const tileId = tiles[ i ];
        const flag = flags[ tileId ];

        // ここでは高層[☆]タイルのみ判定するので他は無視
        if( !(flag & FLAG_UPPER ) ) continue;

        // 上通行不可[・]は特殊設定用のビットに使う
        // そのため通行判定として無視
        if( flag & FLAG_NORTH_DIR ) continue;

        // 高層[☆]の通行不可[・]設定は
        // 他の重なったタイルによらず通行不可
        if(  ( flag & bit ) === bit ) return false;
    }
    return _Game_Map_checkPassage.apply( this, arguments );
};


/**
 * カウンター設定か。
 * @param {Number} tileFlag タイルのフラグ情報
 */
function isCounterTile( tileFlag ){
    return ( tileFlag  & FLAG_COUNTER ) === FLAG_COUNTER;
}

})();
