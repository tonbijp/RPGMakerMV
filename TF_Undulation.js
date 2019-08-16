//========================================
// TF_Undulation.js
// Version :0.6.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/**
 * 
 */
/*:ja
 * @plugindesc 階段など高さの違う箇所を自然に歩く
 * @author とんび@鳶嶋工房
 * 
 * @param TerrainTag
 * @desc この地形タグ+通行設定(4方向)で詳細な段差設定を行う。
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
 * @help
 * 注意 : トリアコンタンさんの HalfMove.js の利用を前提としています。
 * TF_Undulation.js の前に HalfMove.js を配置するようにしてください。
 * 
 * 地形タグと通行設定(4方向)の組み合わせで坂・階段を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 同じ設定のタイルを敷き詰めると、それっぽく衝突判定を行います。
 * 
 * 1. A5BCDEタイルに地形タグ(デフォルト : 1)を指定
 * 
 * 2. 通行設定(4方向)によって、詳細設定
 *      0x0 ↑→←↓ : 段差レベル1(規定値:6px)
 *      0x1 ↑→←・ : 段差レベル2(規定値:12px)
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 27° S 南より
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 27° S 南より
 *      0x6 ↑・・↓ : 段差レベル3(規定値:18px)
 *      0x7 ↑・・・ : 段差レベル4(規定値:24px)
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : ＼ 27° N 北より
 *      0xB ・→・・ : ＼ 45°
 *      0xC ・・←↓ : ／ 27° N 北より
 *      0xD ・・←・ : ／ 45°
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';

/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );

let _TerrainTag = 1;    // 地形タグ規定値

if( pluginParams[ TERRAIN_TAG ] ){
    _TerrainTag = parseInt( pluginParams[ TERRAIN_TAG ], 10 );
} 

// Wは西(左)上がり…＼ 　Eは東(右)上がり…／
const MASK_UNDULATION = 0x001F; // 地形タグ、高層[☆]、通行設定を取り出すマスク
// 段差設定フラグ
const FLAG_BUMP1 = 0x0;
const FLAG_BUMP2 = 0x1;
const FLAG_BUMP3 = 0x6;
const FLAG_BUMP4 = 0x7;
// 傾き設定フラグ
const FLAG_W45 = 0xB;
const FLAG_E45 = 0xD;
const FLAG_W63 = 0x2;
const FLAG_E63 = 0x4;
const FLAG_W27N = 0xA;
const FLAG_W27S = 0x3;
const FLAG_E27N = 0xC;
const FLAG_E27S = 0x5;


// フラグから移動速度の調整比率を得る
const FLAG2RATIO_W = {}; // 西(左)向き←
FLAG2RATIO_W[ FLAG_W45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E45 ] = [ 0.2, -0.2 ]; // ↙︎
FLAG2RATIO_W[ FLAG_W63 ] = [ 0.6, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E63 ] = [ 0.6, -0.2 ]; //  ↙︎
FLAG2RATIO_W[ FLAG_W27N ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E27N ] = [ 0.2, -0.6 ]; // ↙︎
FLAG2RATIO_W[ FLAG_W27S ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E27S ] = [ 0.2, -0.6 ]; // ↙︎
const FLAG2RATIO_E = {}; // 東(右)向き→
FLAG2RATIO_E[ FLAG_W45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E45 ] = [ -0.2, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W63 ] = [ -0.6, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E63 ] = [ -0.6, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W27N ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E27N ] = [ -0.2, 0.6 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W27S ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E27S ] = [ -0.2, 0.6 ]; // ↗︎

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= {}; // 西(左)向き←
FLAG2POS_W[ FLAG_W45 ] = [ 0, -0.5];
FLAG2POS_W[ FLAG_E45 ] = [ 0, 0.5];
FLAG2POS_W[ FLAG_W63 ] = [ 0, -1];
FLAG2POS_W[ FLAG_E63 ] = [ 0, 1];
FLAG2POS_W[ FLAG_W27N ] = [ -0.5, -0.5];
FLAG2POS_W[ FLAG_E27N ] = [ -0.5, 0.5];
FLAG2POS_W[ FLAG_W27S ] = [ -0.5, -0.5];
FLAG2POS_W[ FLAG_E27S ] = [ -0.5, 0.5];
const FLAG2POS_E= {}; // 東(右)向き→
FLAG2POS_E[ FLAG_W45 ] = [ 0, 0.5];
FLAG2POS_E[ FLAG_E45 ] = [ 0, -0.5];
FLAG2POS_E[ FLAG_W63 ] = [ 0, 1];
FLAG2POS_E[ FLAG_E63 ] = [ 0, -1];
FLAG2POS_E[ FLAG_W27N ] = [ 0.5, 0.5];
FLAG2POS_E[ FLAG_E27N ] = [ 0.5, -0.5];
FLAG2POS_E[ FLAG_W27S ] = [ 0.5, 0.5];
FLAG2POS_E[ FLAG_E27S ] = [ 0.5, -0.5];


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
    const isJustX = ( this._realX % 1 ) === 0;
    const isJustY =  ( this._realY % 1 ) === 0;

    // 高低差タイプ
    const undulation = getUndulation( intX, intY );             // 現在地
    const undulationE = getUndulation( intX + 1, intY );   // 東→
    const undulationW = getUndulation( intX - 1,  intY ); // 西←
    const undulationS = getUndulation( intX, intY + 1 );   // 南↓
    const undulationN = getUndulation( intX, intY - 1 );   // 北↑

    const isNorthTile = undulation !== undulationN;
    const isSouthTile = undulation !== undulationS;
    
    const isSameVerticalTile = ( dy )=>{
        return undulation === getUndulation( intX, intY + dy );
    };
    const isSameVerticalTileW = ( dy )=>{
        return undulationW === getUndulation( intX - 1, intY + dy );
    };

    const isW27Tile = ( undulation )=>{
        return undulation === FLAG_W27N ||  undulation === FLAG_W27S
    };
    const isSameVerticalW27SNTile = ( dy )=>{
        return isW27Tile( undulation ) && isW27Tile( getUndulation( intX, intY + dy ) );
    };
    const isSameVerticalW27SNTileW = ( dy )=>{
        return isW27Tile( undulationW ) && isW27Tile( getUndulation( intX - 1, intY + dy ) );
    };
    const isE27Tile = ( undulation )=>{
        return undulation === FLAG_E27N ||  undulation === FLAG_E27S
    };
    const isSameVerticalE27SNTile = ( dy )=>{
        return isE27Tile( undulation ) && isE27Tile( getUndulation( intX, intY + dy ) );
    };
    const isSameVerticalE27SNTileW = ( dy )=>{
        return isE27Tile( undulationW ) && isE27Tile( getUndulation( intX - 1, intY + dy ) );
    };


    // ＼ FLAG_W27N
    if( undulation === FLAG_W27N && !isJustX && !isJustY && d === 8 && !isSameVerticalW27SNTile( -1 )) return false;

    if( undulationE === FLAG_W27N && isJustX && d === 6 && !isW27Tile( getUndulation( intX + 1, intY - 1 ) ) ) return true;

    if( undulationW === FLAG_W27N ){
        const undulationNW = getUndulation( intX - 1, intY - 1 );
        const undulationSW = getUndulation( intX - 1, intY + 1 );
        if( isJustX ){
            if( isJustY && d === 4 && !isW27Tile( undulationSW ) ) return false;
        }else if( isJustY ){
            if( d === 8 && !isW27Tile( undulationNW ) ) return false;
        }else if( d === 8 ){
            if( !isW27Tile( undulationSW ) ) return true;
        }else if( d === 2 ){
            if( !isW27Tile( undulationNW ) ) return false;
            if( !isW27Tile( undulationSW ) ) return false;
        }
    }

    if( undulationS === FLAG_W27N && isJustY && d === 2 ){
        if( isW27Tile( undulation ) ){
            if( !isJustX && !isSameVerticalW27SNTile( 2 ) ) return false;
        }else return false;
    }

    if( !isJustX && isJustY && d === 2
        && getUndulation( intX - 1, intY + 1 ) === FLAG_W27N
        &&  !isW27Tile( getUndulation( intX - 1, intY + 2 ) )
    ) return true;


    // ／ FLAG_E27N
    if( undulation === FLAG_E27N && !isJustX ){
        if( isJustY ){
            if( d === 8 && !isE27Tile( undulationN ) ) return false;
        }else if( d === 8 ){
            if( !isE27Tile( undulationS ) ) return true;
        }else if( d === 2 ){
            if( !isE27Tile( undulationN ) ) return false;
            if( !isE27Tile( undulationS ) ) return false;
        }
    }

    if( undulationS === FLAG_E27N && !isJustX && isJustY && !isE27Tile( getUndulation( intX, intY + 2 ) ) ) return true;

    if( d === 2 ){
        if( isJustY && !isE27Tile( undulation ) ){
            if( isJustX && undulationS === FLAG_E27N ) return false;
            if( !isJustX && getUndulation( intX - 1, intY + 1 ) === FLAG_E27N ) return false;
        }
    }

    if( d === 6 ){
        if( undulationE === FLAG_E27N && isJustX && isJustY && !isE27Tile( getUndulation( intX + 1, intY + 1 ) ) ) return false;
    }else if( d === 8 && !isJustY ){
        if( !isJustX ){
            if( getUndulation( intX - 1, intY - 1 ) === FLAG_E27N && !isE27Tile( getUndulation( intX - 1, intY - 2 ) )  ) return true;
            if( undulationN === FLAG_E27N && isE27Tile( undulation ) && !isSameVerticalW27SNTile( -2 ) ) return true;
            if( undulationW === FLAG_E27N && !isSameVerticalW27SNTileW( - 1 ) ) return false;
        }
        // FLAG_W27N・FLAG_E27Nの下部タイル
        if( undulationN === FLAG_W27N && !isW27Tile( undulation ) ) return false;
        if( undulationN === FLAG_E27N && !isE27Tile( undulation ) ) return false;
    }


    // ＼ FLAG_W27S
    if( !isJustX ){
        if( d === 8 && !isJustY 
            && getUndulation( intX - 1, intY - 1 ) === FLAG_W27S
            &&  !isW27Tile( getUndulation( intX - 1, intY - 2 ) )
        ) return false;
    }

    if( undulation === FLAG_W27S ){
        if( isJustX ){
            if( !isJustY && d === 2 && !isSameVerticalW27SNTile( -1 ) ) return false;
        }else if( isJustY ){
            if( !isW27Tile( undulationN ) ){
                if( d === 2 ) return true;
                if( d === 8 ) return false;
            }
        }else if( d === 2 ){
            if( !isSameVerticalW27SNTile( 1 ) || !isSameVerticalW27SNTile( -1 ) ) return false;
        }else if( d === 8 && !isSameVerticalW27SNTile( 1 ) ) return true;
    }else if( undulationE === FLAG_W27S ){
        if( isJustX && !isJustY && d === 6 && getUndulation( intX + 1, intY + 1 ) !== FLAG_W27S ) return true;
    }
    
    if( undulationW === FLAG_W27S && !isJustX && isJustY && d === 2 && !isSameVerticalW27SNTileW( -1 ) ) return false;

    if( !isJustX ){
        if( d === 2 ){
            if( isJustY && getUndulation( intX - 1, intY + 1 ) === FLAG_W27S && !isSameVerticalW27SNTileW( 2 ) ) return true;
        }
    }

    // ／ FLAG_E27S
    if( undulation === FLAG_E27S ){
        if( isJustX ){
            if( !isJustY && d === 2 && !isSameVerticalE27SNTile( -1 ) ) return false;
        }else if( isJustY && d === 2 && !isSameVerticalE27SNTile( -1 ) ) return false;
    }

    if( undulationW === FLAG_E27S ){
        if( isJustX ){
            if( !isJustY && d === 4 && !isSameVerticalE27SNTileW( 1 ) ) return true;
        }else if( isJustY ){
            if( !isSameVerticalE27SNTileW( -1 ) ){
                if( d === 2 ) return true;
                if( d === 8 ) return false;
            }
        }else if( d === 2 ){
            if( !isSameVerticalE27SNTileW( - 1 ) || !isSameVerticalE27SNTileW( 1 ) ) return false;
        }else if( d === 8 && !isSameVerticalE27SNTileW( 1 ) ) return true;
    }

    if( d === 8 && !isJustX && !isJustY && undulationN === FLAG_E27S && !isE27Tile( getUndulation( intX, intY - 2 ) )) return false;
    if( d === 2 && !isJustX && isJustY && getUndulation( intX - 1, intY + 1 ) === FLAG_E27S
        && !isSameVerticalE27SNTileW( 2 ) ) return true;

    // FLAG_W27N・FLAG_W27S・FLAG_E27N・FLAG_E27S 共通の中央部分タイル
    if( d === 2 || d === 8 ){
        if( isSameVerticalW27SNTile( 1 ) && isSameVerticalW27SNTile( -1 ) ) return true;
        if( isSameVerticalE27SNTile( 1 ) && isSameVerticalE27SNTile( -1 ) ) return true;
    }


    // \  FLAG_W63
    if( undulation === FLAG_W63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && isSouthTile ) return false;
            }else if( d === 2 || d === 4 ){
                if( isNorthTile ) return false;
            }else if( d === 8 && !isNorthTile && !isSameVerticalTile( -2 ) ) return false;
            if( d === 4 ) return true;
        }else if( !isJustY && d === 8 && isNorthTile ) return false;
    }else if( isJustX ){
        if( undulationN === FLAG_W63 && !isJustY && d === 8 && isNorthTile ) return false;
    }else if( isJustY ){
        if( d === 4 ){
            if( undulationW === FLAG_W63  && !isSameVerticalTileW( - 1 ) ) return false;
        }else if( d === 2 && undulationS === FLAG_W63 && isSouthTile ) return false;
    }

    //  / FLAG_E63
    if( undulation === FLAG_E63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && isSouthTile ) return false;
            }else if( d === 2 || d === 6 ){
                if( isNorthTile ) return false;
            }else if( d === 8 && !isNorthTile && !isSameVerticalTile( -2 ) ) return false;
            if( d === 6 ) return true;
        }else if( isJustY && d === 6 && isNorthTile ) return false;
    }else if( isJustX && undulationN === FLAG_E63 && !isJustY && d === 8 && isNorthTile ) return false;

    if( !isJustX ){
        if( isJustY ){
            if( d === 2 && undulationW !== FLAG_E63 && getUndulation( intX - 1, intY + 1 ) === FLAG_E63 ) return false;
        }else if( d === 8 ){
            if( undulationW === FLAG_E63 ){
                if( !isSameVerticalTileW( - 1 ) ) return false;
            }else if( getUndulation( intX - 1, intY - 1 ) === FLAG_E63 ) return false;
        }
    }

    // ＼ FLAG_W45
    if( undulation === FLAG_W45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && isNorthTile ) return false;
            }else if( d === 2 ){
                if( isSouthTile || isNorthTile ) return false;
            }else if( ( d === 8 || d === 4 ) && !isNorthTile ) return true;
        }else if( isJustY ){
            if( d === 2 && !isSouthTile ) return  isSameVerticalTile( 2 );
        }else if( d === 8 && isNorthTile ) return false;
    }else if( !isJustX ){
        if( isJustY ){
            if( d === 2 && ( ( undulationS === FLAG_W45 )
                || ( undulationW === FLAG_W45 && !isSameVerticalTileW( - 1 ) ) ) ) return false;
        }else if( undulationW === FLAG_W45 && !isJustY && d === 8
            && isSameVerticalTileW( - 1 ) && !isSameVerticalTileW( - 2 ) ) return false;
    }

    // ／ FLAG_E45
    if( undulation === FLAG_E45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && isNorthTile ) return false;
            }else if( d === 2 ){
                if( isSouthTile || isNorthTile ) return false;
            }else if( ( d === 8 ||  d === 6 ) && !isNorthTile ) return true;
        }else if( isJustY ){
            if( d === 2 ) return !isNorthTile && !isSouthTile;
        }else if( d === 8 && !isNorthTile ) return isSameVerticalTile( - 2 );
    }else if( undulationW === FLAG_E45 && !isJustX && d === 8 && !isSameVerticalTileW( - 1 ) ){
        if( isSameVerticalTileW( 1 ) ){
            if( !isJustY ) return false;
        }else if( isJustY ) return false;
    }

    return _Game_CharacterBase_isMapPassable.apply( this, arguments );
}

/**
 * 移動から停止・停止から移動に切り替わったタイミングを調べる。
 */
const _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
    if( this.chaseCharacter ) { // followerは除外
        _Game_CharacterBase_updateMove.call( this );
        return;
    }

    const preRealX = this._realX;
    const tileX = ( preRealX + 0.5 ) % 1;
    const isW =  this.x < preRealX;
    if( this._realX != this.x ){ //移動中
        const undulation = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulation !== -1 ){

            const ratioXY = isW ? FLAG2RATIO_W[ undulation ] : FLAG2RATIO_E[ undulation ];
            if( ratioXY && !( ( undulation === FLAG_W63 && 0.5 < tileX ) || ( undulation === FLAG_E63 && tileX < 0.5 ) ) ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }

    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulation = getUndulation( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulation === -1 || ( preRealX * 2 ) !== Math.floor( preRealX * 2 ) ) return;

    const targetPos = isW ? FLAG2POS_W[ undulation ] : FLAG2POS_E[ undulation ];
    if( targetPos === undefined ) return;

    // 角度63の坂は半分だけ動かす
    if( undulation === FLAG_W63 ){
        if( isW ){
            if( tileX === 0 ) return;
        } else {
            if( tileX === 0.5 ) return;
        }
    }else if( undulation === FLAG_E63 ){
        if( isW ){
            if( tileX === 0.5 ) return;
        } else {
            if( tileX === 0 ) return;
        }
    }

    //動き始め
    this._x = $gameMap.roundX( this._x + targetPos[ 0 ] );
    //this._realX -= targetPos[ 0 ];
    this._y = $gameMap.roundY( this._y + targetPos[ 1 ] );
    this._realY = this._y - targetPos[ 1 ];
}


 // フラグから段差の量を得る
 const FLAG2BUMP= {};
 FLAG2BUMP[ FLAG_BUMP1 ] = 6;
 FLAG2BUMP[ FLAG_BUMP2 ] = 12;
 FLAG2BUMP[ FLAG_BUMP3 ] = 18;
 FLAG2BUMP[ FLAG_BUMP4 ] = 24;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = ( this._realX + 0.5 ) % 1;
    const intX = Math.floor( this._realX + 0.5 );
    const intY = Math.floor( this._realY + 0.5 );
    const undulationL = ( tileX === 0 )? getUndulation( intX - 1, intY ) : -1;
    const undulationR = getUndulation( intX, intY );
    if( -1 === undulationL && -1 === undulationR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulation 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getBump = ( undulation )=>{
        if( undulation === -1 ) return 0;
        const bump = FLAG2BUMP[ undulation ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getBump( undulationR );
    const dYL = getBump( undulationL );
    return shiftY + Math.max( dYL, dYR );
}


/*---- Game_Player ----*/
/**
 * 階段の上の場合、4方向移動に固定
 * @param {Number} d 向き(テンキー対応)
 */
var _Game_Player_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function( d ) {
    const tmpD = [ 0, 4, 2, 6, 4, 5, 6, 4, 8, 6 ][ d ];
    const targetX =  ( tmpD === 6 ) ? $gameMap.roundX( this.x + 0.5 ) : this.x ;

    if(   FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y - 1 ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y ) ) ]
        || FLAG2RATIO_W[ getUndulation( targetX , $gameMap.roundY( this.y + 1 ) ) ]
    ){
        this.moveStraight( tmpD );
    }else{
        _Game_Player_executeMove.apply( this, arguments );
    }
}

/*---- Game_Map ----*/
/**
 * 指定位置の指定方向が通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 
 */
const _Game_Map_isPassable = Game_Map.prototype.isPassable;
Game_Map.prototype.isPassable = function( x, y, d ){
    if( this.terrainTag( x, y ) !== _TerrainTag ) return  _Game_Map_isPassable.apply( this, arguments );

    const undulation = getUndulation( x, y );
    // 高低差判定がある場合は全方向通行可
    if( FLAG2BUMP[ undulation ] ) return true;

    const undulationS = getUndulation( x, y + 1 );
    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulation ] ){
        if( undulation === undulationS
            // FLAG_W27N・FLAG_W27S および FLAG_E27S・FLAG_E27Nは同じとみなす
            || ( undulation === FLAG_W27N && undulationS === FLAG_W27S )
            || ( undulation === FLAG_W27S && undulationS === FLAG_W27N )
            || ( undulation === FLAG_E27N && undulationS === FLAG_E27S )
            || ( undulation === FLAG_E27S && undulationS === FLAG_E27N )
        ) return true;
    }

    return _Game_Map_isPassable.apply( this, arguments );
};



/*---- ユーティリティ関数 ----*/
/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulation 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function getUndulation( x, y ){
    x = Math.floor( $gameMap.roundX( x ) );
    y = Math.floor( $gameMap.roundY( y ) );
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( x, y );
    
    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if ( ( flag  >> 12 ) === _TerrainTag ) return flag & MASK_UNDULATION;
    }    
    return -1;
}
})();
