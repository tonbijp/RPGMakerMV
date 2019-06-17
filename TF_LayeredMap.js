//========================================
// TF_LayeredMap.js
// Version :0.5.0.0
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
 * @param FillWithNorthTile
 * @type boolean
 * @text Suply : ON(true) | 処理なし : OFF(false)
 * @desc Fill with north tile. It is function for A3 or A4 tile.
 * @default true
 * 
 * @param DefaultLowerTile
 * @desc 
 * Start with 0 at upper left A5 to right.
 * @default 16
 * 
 * 
 * @help
 * Change tile behavior by use no effect option at default.
 * 
 * 1. Set [counter]option for A3・A4 tile.
 *      [○] Behavior like[☆]
 *      [×] Hide only upper tile.
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
 *      0xB ・→・・ : undefined
 *      0xC ・・←↓ : undefined
 *      0xD ・・←・ : undefined
 *      0xE ・・・↓ : undefined
 *      0xF ・・・・ : undefined
 * 
 * Released under the MIT License.
 */
/*:ja
 * @plugindesc 高層[☆]タイルを書き割り風に配置する
 * @author とんび@鳶嶋工房
 * 
 * @param FillWithNorthTile
 * @type boolean
 * @text 北タイルでの補完 : ON(true) | 指定タイルでの補完 : OFF(false)
 * @desc 低層を北位置のタイルで補完するか
 * @default true
 * 
 * @param DefaultLowerTile
 * @desc FillWithNorthTileがOFFの場合の補完指定タイルの番号
 * 番号はA5左上を0として右への順(デフォルトは草原)
 * @default 16
 * 
 * @help 
 * デフォルトで未使用の設定で、タイルの重なりが変化します。
 * 
 * 1. A3・A4タイルに[カウンター]を設定
 *      [○] 下を通れる(ほぼ[☆]の状態)
 *      [×] 上部タイルのみ後ろに回り込む
 * 
 * 2. BCDEタイルに[☆]を指定したあと、通行設定(4方向)
 *      0x0 ↑→←↓ : [☆] 設定、全方向に 通行可(プラグインなしと同じ)
 *      0x1 ↑→←・ : 書き割り、上　左右 通行可、1階 【基本、柵とか】
 *      0x2 ↑→・↓ : 書き割り、上下　右 通行可、1階 （柵の左側とか）┃
 *      0x3 ↑→・・ : 書き割り、上　　右 通行可、1階（(柵の左下とか）┗
 *      0x4 ↑・←↓ : 書き割り、上下左　 通行可、1階 （柵の右側とか）   ┃
 *      0x5 ↑・←・ : 書き割り、上　左　 通行可、1階 （柵の右下とか）   ┛
 *      0x6 ↑・・↓ : 書き割り、上下　　 通行可、1階 （両脇に木とか）┃┃
 *      0x7 ↑・・・ : 書き割り、上　　　 通行可、1階 （張り出し的な）┗┛
 *      0x8 ・→←↓ : 書き割り、全方向に 通行可、1階 （草むらなどに）
 *      0x9 ・→←・ : 書き割り、全方向に 通行可、2階
 *      0xA ・→・↓ : 書き割り、全方向に 通行可、3階
 *      0xB ・→・・ : 未設定
 *      0xC ・・←↓ : 書き割り、全方向に 通行可、1階優先オート(※1)
 *      0xD ・・←・ : 書き割り、全方向に 通行可、2階優先オート(※1)
 *      0xE ・・・↓ : 書き割り、全方向に 通行可、3階優先オート(※1)
 *      0xF ・・・・ : 未設定
 * 
 * ※1 オートは以下の法則で配置されます。
 *      ・南(画面下)に接地面(上に接続)タイルがあれば、2階
 *      ・南(画面下)に中間(上下に接続)タイルがあれば、3階
 *      ・南(画面下)にそれ以外ならば、優先階
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';

const PLUGIN_NAME = 'TF_LayeredMap';
const SUPPLEMENT_ENABLED = 'FillWithNorthTile';
let _FillWithNorthTile = true;

const DEFAULT_LOWER_TILE = 'DefaultLowerTile';
let _defaultLowerTileId = 16;

// flag用定数
const FLAG_UPPER = 0x10; // 高層[☆]
const FLAG_COUNTER = 0x80; // カウンター
const FLAG_UPPER_COUNTER = 0x90;    // 高層[☆]とカウンター
const FLAG_ALL_DIR = 0xF;  // 全方向の通行設定
const FLAG_NORTH_DIR = 0x08 // 上方向の通行設定
const FLAG_WITHOUT_DIR_UPPER = 0xFFE0; // 方向と高層[☆]を除いたもの

// 書割り設定
const FLOOR2_BOARD = 0x9; // 書き割り、全方向に 通行可、2階
const FLOOR3_BOARD = 0xA; // 書き割り、全方向に 通行可、3階
const FLOOR2_BOARD_AUTO = 0xD; // 書き割り、全方向に 通行可、2階優先オート
const FLOOR3_BOARD_AUTO = 0xE; // 書き割り、全方向に 通行可、3階優先オート

const AUTOTILE_BLOCK = 48; // オートタイル1ブロック分のパターン数

/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );

if( pluginParams[ SUPPLEMENT_ENABLED ] ){
    _FillWithNorthTile = ( pluginParams[ SUPPLEMENT_ENABLED ].toLowerCase() === 'true' );
} 

if( pluginParams[ DEFAULT_LOWER_TILE ] ){
    _defaultLowerTileId = parseInt( pluginParams[ DEFAULT_LOWER_TILE ], 10 );
}
_defaultLowerTileId += Tilemap.TILE_ID_A5;


/*---- Game_Interpreter ----*/
/**
 * プラグインコマンドの実行
 */
const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function ( command, args ){
    _Game_Interpreter_pluginCommand.call( this, command, args );

    if( command.toUpperCase() !== SUPPLEMENT_ENABLED ) return;

    _FillWithNorthTile = ( args[0].toLowerCase() === 'true' );
};

 
/*---- ShaderTilemap ----*/
/**
 * タイルセットの画像を設定する。
 * マップ開始時に呼ばれる。
 */
const _ShaderTilemaprefreshTileset = ShaderTilemap.prototype.refreshTileset;
ShaderTilemap.prototype.refreshTileset = function() {
    _ShaderTilemaprefreshTileset.call( this );

    // BitmapをPIXI.Textureにコンバート
    const bitmaps = this.bitmaps.map( function( x ) {
        return x._baseTexture ? new PIXI.Texture( x._baseTexture ) : x;
   } );

   // 書き割りのタイルセットの画像をアップデート
   for( let curItem of this.TF_billboards ){
        curItem.children[0].setBitmaps( bitmaps );
   }
}

/**
 * 書き割りレイヤーの生成と追加
 */
const _ShaderTilemap_createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function() {
    _ShaderTilemap_createLayers.call(this);

    // 書き割り風オブジェクトを生成
    // +3 はスクロールの際にはみ出す部分と2・3階用
    const th = this._tileHeight;
    const tileRows = Math.ceil(this._height / th) + 3;

    if( !this.hasOwnProperty( 'TF_billboards' ) ){
        this.TF_billboards = [];
    }

    for( let i = 0; i < tileRows; i++ ){
        const billboard = new PIXI.tilemap.ZLayer( this, 3 );
        billboard.spriteId = Infinity;
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
ShaderTilemap.prototype._paintAllTiles = function(startX, startY) {
    for( let curItem of this.TF_billboards ){
        curItem.clear();
    }

    _ShaderTilemap_paintAllTiles.call( this, startX, startY );
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
//const _ShaderTilemap_paintTiles = ShaderTilemap.prototype._paintTiles;
ShaderTilemap.prototype._paintTiles = function( startX, startY, x, y ) {
    //_ShaderTilemap_paintTiles.call( this, startX, startY, x, y );

    const mx = startX + x; //  描画対象のマップ x座標(タイル数)
    const my = startY + y; //  描画対象のマップ y座標(タイル数)
    const dx = x * this._tileWidth; //  描画位置の x座標(ピクセル)
    const dy = y * this._tileHeight; //  描画位置の y座標(ピクセル)

    const tileId0 = this._readMapData( mx, my, 0 ); // 低層タイルA
    const tileId1 = this._readMapData( mx, my, 1 ); // 低層タイルA2右側など
    const tileId2 = this._readMapData( mx, my, 2 ); // B 〜 E タイル
    const tileId3 = this._readMapData( mx, my, 3 ); // B 〜 E タイル
    const shadowBits = this._readMapData( mx, my, 4 ); // 影ペン
    const upperTileId1 = this._readMapData( mx, my - 1, 1 ); // 上位置の低層タイルA

    const lowerLayer = this.lowerLayer.children[ 0 ];     // 低層レイヤ( z: 0 )
    const upperLayer = this.upperLayer.children[ 0 ];   // 高層レイヤ( z: 4 )

    /**
     * タイルを描画(upperLayer,lowerLayer,dx,dy は親の変数を使う)
     * @param {Number} tileId タイルID
     */
    const drawTile = ( tileId ) => {
        if ( !this._isHigherTile( tileId ) ) {
            this._drawTile( lowerLayer, tileId, dx, dy );
            return;
        }
    
        if( ( this.flags[ tileId ] & FLOOR2_BOARD ) === FLOOR2_BOARD ){
            //TODO:壁の場合は南位置のタイルによって階数を変更する
            // 壁はA4・カウンター・通行可[○]の設定
            // 2階設定は、ひとつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 1 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 2 );

        }else if( ( this.flags[ tileId ] & FLOOR3_BOARD ) === FLOOR3_BOARD ){
            //TODO:壁の場合は南位置のタイルによって階数を変更する
            // 3階設定は、ふたつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 2 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 3 );

        }else if( this.flags[ tileId ] & FLAG_ALL_DIR ){
            // 通行不可設定のどれかがONだと書き割り
            this._drawTile( this.TF_billboards[ y ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight );

        }else{
            // 全方向通行可の場合は通常の高層[☆]表示
            this._drawTile( upperLayer, tileId, dx, dy );
        }
    }
    
    drawTile( tileId0 );
    drawTile( tileId1 );

    this._drawShadow( lowerLayer, shadowBits, dx, dy );
    if ( this._isTableTile( upperTileId1 ) && !this._isTableTile( tileId1 ) ) {
        if ( !Tilemap.isShadowingTile( tileId0 ) ) {
            this._drawTableEdge( lowerLayer, upperTileId1, dx, dy );
        }
    }

    if ( this._isOverpassPosition( mx, my ) ) {
        this._drawTile( upperLayer, tileId2, dx, dy );
        this._drawTile( upperLayer, tileId3, dx, dy );
    } else {
        drawTile( tileId2 );
        drawTile( tileId3 );
    }
};

/**
 * (スクロールに合わせて)書き割りの表示位置を変更
 * @param {Number} startX
 * @param {Number} startY
 */
const _ShaderTilemap_updateLayerPositions = ShaderTilemap.prototype._updateLayerPositions;
ShaderTilemap.prototype._updateLayerPositions = function( startX, startY ) {
    _ShaderTilemap_updateLayerPositions.call( this, startX, startY );

    let ox,oy;
    if (this.roundPixels) {
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
    for( let i = 0; i < l; i++ ) {
        const curItem = this.TF_billboards[ i ];
        curItem.position.x = posX;
        curItem.position.y = posY + ( i + 1) * th;
    };
};

/*---- DataManager ---*/
// オートタイル通行flag
// 屋根 A3 奇数列
const ROOF_PASS_EDGE = [
    0, 2, 17, 17, 
    4, 6, 17, 17, 
    0, 2, 17, 17, 
    4, 6, 17, 17, 
];
// 壁(上面) A4 奇数列
const WALL_TOP_PASS_EDGE = [
    0, 2, 4, 6, 0, 2, 4, 6,
    0, 2, 4, 6, 0, 2, 4, 6,
    2, 6, 2, 6, 17, 17, 17, 17,
    4, 4, 6, 6, 0, 2, 4, 6,
    6, 17, 17, 17, 17, 17, 4, 6,
    2, 6, 17, 17, 6, 17, 17, 
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
 * 4ビット(8以上) = 1階
 * 2ビット(& 2) = 3階
 */
function getFloor( patternNo ){
    return ( patternNo & 8 )? 1 : ( patternNo & 2 )? 3 : 2;
}

/**
 * 読み込み直後に、タイルセットデータを書き換える
 */
const _DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object ){
    _DataManager_onLoad.call( this, object );

    if( object === $dataTilesets ) treatDataTilesets();
    // end: onLoad

    /**
     * カウンター設定しているA3・A4オートタイルを回り込みに設定
     */
    function treatDataTilesets(){
        // 全タイルセットに対して設定
        for( const curTileset of $dataTilesets ){
            if( !curTileset ) continue;
            const flags = curTileset.flags;

            // 屋根タイル(A3)を走査
            for( let tileId = Tilemap.TILE_ID_A3; tileId < Tilemap.TILE_ID_A4; tileId += AUTOTILE_BLOCK ) {
                if( !isCounterTile( flags[ tileId ] ) ) continue;

                if( Tilemap.isRoofTile( tileId ) ){
                    roof2UpperLayer( flags, tileId );
                }else{
                    wallSide2UpperLayer( flags, tileId );
                }
            }

            // 壁タイル(A4)を走査
            for( let tileId = Tilemap.TILE_ID_A4; tileId < Tilemap.TILE_ID_MAX; tileId += AUTOTILE_BLOCK ) {
                if( !isCounterTile( flags[ tileId ] ) ) continue;

                if( Tilemap.isWallTopTile( tileId ) ){
                    wallTop2UpperLayer( flags, tileId );
                }else{
                    wallSide2UpperLayer( flags, tileId );
                }
            }
        }

        // カウンター設定か
        function isCounterTile( tileFlag ){
            return ( tileFlag  & FLAG_COUNTER ) === FLAG_COUNTER;
        }
    }

    //  屋根の通行設定
    function roof2UpperLayer( flags, tileId ){
        if(  flags[ tileId + 15 ] & FLAG_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i=0; i < 16; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | ROOF_PASS_EDGE[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可
            for( let i=0; i < 16; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }
    //  壁(上面)の通行設定
    function wallTop2UpperLayer( flags, tileId ){
        if(  flags[ tileId + 46 ] & FLAG_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i=0; i < 47; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | WALL_TOP_PASS_EDGE[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可
            for( let i=0; i < 47; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }
    //  壁(側面)の通行設定
    function wallSide2UpperLayer( flags, tileId ){
        if(  flags[ tileId + 15 ] & FLAG_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i=0; i < 16; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | WALL_SIDE_PASS_EDGE[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可(一番下のみ通行不可)
            for( let i=0; i < 16; i++ ){
                flags[ tileId + i  ] = flags[ tileId + i ] & FLAG_WITHOUT_DIR_UPPER | WALL_SIDE_PASS[ i ];
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
        const flags = $dataTilesets[ $dataMap.tilesetId ].flags;
        for( let y = 0; y < $dataMap.height; y++ ){
            for( let x = 0; x < $dataMap.width; x++ ){
                const tileId = getMapData( x, y, 0 );

                if( !( ( Tilemap.isTileA3( tileId ) || Tilemap.isTileA4( tileId ) ) && isUpperCounter( flags[ tileId ]) ) ) continue;
                // A3・A4のカウンター設定かつ高層[☆]なら、タイルを補完
                setMapData( x, y, 1, tileId );

                if( _FillWithNorthTile ){
                    // 北タイルで補完
                    const upTileId = ( y === 0 )? getMapData( x, $dataMap.height - 1, 0 ) : getMapData( x, y - 1, 0 );
                    setMapData( x, y, 0, upTileId );
                } else {
                    // 指定タイルで補完
                    setMapData( x, y, 0, _defaultLowerTileId );
                }
            }
        }

        function getMapData( x, y, z ){
            return $dataMap.data[ x + ( y + z * $dataMap.height ) * $dataMap.width ];
        }
        function setMapData( x, y, z, tileId ){
            $dataMap.data[ x + ( y + z * $dataMap.height ) * $dataMap.width ] = tileId;
        }
        function isUpperCounter( tileFlag ){
            return  ( tileFlag & FLAG_UPPER_COUNTER ) === FLAG_UPPER_COUNTER;
        }
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
        if( flag & FLAG_NORTH_DIR  ) continue;

        // 高層[☆]の通行不可[・]設定は
        // 他の重なったタイルによらず通行不可
        if(  ( flag & bit ) === bit ) return false;
    }
    return _Game_Map_checkPassage.call( this, x, y, bit );
};
})();
