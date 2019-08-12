//========================================
// TF_Undulation.js
// Version :0.2.1.0
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
 * 
 * @param TerrainTag
 * @desc この地形タグ+通行設定(4方向)で詳細な段差設定を行う。
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
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
 *      0x0 ↑→←↓ : 高さレベル1(規定値:8px)
 *      0x1 ↑→←・ : 高さレベル2(規定値:16px)
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 45°
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 45°
 *      0x6 ↑・・↓ : 高さレベル3(規定値:24px)
 *      0x7 ↑・・・ : 未設定
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : ＼ 27° A
 *      0xB ・→・・ : ＼ 27° B
 *      0xC ・・←↓ : ／ 27° A
 *      0xD ・・←・ : ／ 27° B
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';

/*
まずは45だけ作る

地形タグ+方向設定で16バリエーションが出せる。
茂み・梯子・カウンターを加えればさらに複雑な設定が可能。
*/


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
const FLAG_BUMP1 = 0x0;
const FLAG_BUMP2 = 0x1;
const FLAG_BUMP3 = 0x6;
const FLAG_W45 = 0x3;
const FLAG_E45 = 0x5;
const FLAG_W63 = 0x2;
const FLAG_E63 = 0x4;
const FLAG_W27A = 0xA;
const FLAG_W27B = 0xB;
const FLAG_E27A = 0xC;
const FLAG_E27B = 0xD;


// フラグから移動速度の調整比率を得る
const FLAG2RATIO_W = {}; // 西(左)向き←
FLAG2RATIO_W[ FLAG_W45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E45 ] = [ 0.2, -0.2 ]; // ↙︎
FLAG2RATIO_W[ FLAG_W63 ] = [ 0.6, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E63 ] = [ 0.6, -0.2 ]; //  ↙︎
FLAG2RATIO_W[ FLAG_W27B ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E27B ] = [ 0.2, -0.6 ]; // ↙︎
const FLAG2RATIO_E = {}; // 東(右)向き→
FLAG2RATIO_E[ FLAG_W45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E45 ] = [ -0.2, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W63 ] = [ -0.6, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E63 ] = [ -0.6, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W27B ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E27B ] = [ -0.2, 0.6 ]; // ↗︎

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= {}; // 西(左)向き←
FLAG2POS_W[ FLAG_W45 ] = [ 0, -0.5];
FLAG2POS_W[ FLAG_E45 ] = [ 0, 0.5];
FLAG2POS_W[ FLAG_W63 ] = [ 0, -1];
FLAG2POS_W[ FLAG_E63 ] = [ 0, 1];
FLAG2POS_W[ FLAG_W27B ] = [ -0.5, -0.5];
FLAG2POS_W[ FLAG_E27B ] = [ -0.5, 0.5];
const FLAG2POS_E= {}; // 東(右)向き→
FLAG2POS_E[ FLAG_W45 ] = [ 0, 0.5];
FLAG2POS_E[ FLAG_E45 ] = [ 0, -0.5];
FLAG2POS_E[ FLAG_W63 ] = [ 0, 1];
FLAG2POS_E[ FLAG_E63 ] = [ 0, -1];
FLAG2POS_E[ FLAG_W27B ] = [ 0.5, 0.5];
FLAG2POS_E[ FLAG_E27B ] = [ 0.5, -0.5];


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
    const undulationType = getUndulationType( intX, intY );
    const undulationTypeW = getUndulationType( intX - 1,  intY );
    const isSameVerticalTile = ( dy )=>{
        return undulationType === getUndulationType( intX, intY + dy );
    };
    const isSameVerticalTileW = ( dy )=>{
        return undulationTypeW === getUndulationType( intX - 1, intY + dy );
    };

    // FLAG_W27B

    // FLAG_E27B
    if( undulationType === FLAG_E27B ){
        if( isJustX ){
            if( isJustY && d === 2 && !isSameVerticalTile( -1 ) ) return false;
        }else{
            if( isJustY ){
                if( d === 2 && !isSameVerticalTile( -1 ) ) return false;
                if( d === 2 && !isSameVerticalTile( 1 ) )return false;
            }else if( d === 8 && isSameVerticalTile( -1 ) && !isSameVerticalTile( -2 ) ) return false;
            if( d === 2 || d === 8 ) return true;
        }
    }else if( undulationTypeW === FLAG_E27B ){
        if( isJustX ){
            if( !isJustY && d === 4 && !isSameVerticalTileW( 1 ) ) return true;
        }else if( isJustY ){
            if( d === 2 ) return true;
            if( d === 8 &&  !isSameVerticalTileW( -1 ) ) return false;
        }else if( !isSameVerticalTileW( 1 ) ){
            if( d === 2 ) return false;
            if( d === 8 ) return true;
        }
    }

    // FLAG_W63
    if( undulationType === FLAG_W63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && !isSameVerticalTile( 1 ) ) return false;
            }else if( d === 2 || d === 4 ){
                if( !isSameVerticalTile( -1 ) ) return false;
            }else if( d === 8 && isSameVerticalTile( -1 ) && !isSameVerticalTile( -2 ) ) return false;
            if( d === 4 ) return true;
        }else if( !isJustY && d === 8 && !isSameVerticalTile( -1 ) ) return false;
    }else if( isJustX ){
        if( !isJustY && d === 8
            && getUndulationType( intX, intY - 1 ) === FLAG_W63
            && !isSameVerticalTile( -1 )
        ) return false;
    }else if( isJustY ){
        if( d === 4 ){
            if( undulationTypeW === FLAG_W63  && !isSameVerticalTileW( - 1 )
            ) return false;
        }else if( d === 2 && getUndulationType( intX, intY + 1 ) === FLAG_W63 && !isSameVerticalTile( 1 ) ) return false;
    }

    // FLAG_E63
    if( undulationType === FLAG_E63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && !isSameVerticalTile( 1 ) ) return false;
            }else if( d === 2 || d === 6 ){
                if( !isSameVerticalTile( -1 ) ) return false;
            }else if( d === 8 && isSameVerticalTile( -1 ) && !isSameVerticalTile( -2 ) ) return false;
            if( d === 6 ) return true;
        }else if( isJustY && d === 6 && !isSameVerticalTile( -1 ) ) return false;
    }else if( isJustX ){
        if( !isJustY && d === 8
            && getUndulationType( intX, intY - 1 ) === FLAG_E63
            && !isSameVerticalTile( -1 )
        ) return false;
    }
    if( !isJustX ){
        if( isJustY ){ // FLAG_E63に乗っている時も使うので else でつなげていない
            if( d === 2
                && undulationTypeW !== FLAG_E63
                && getUndulationType( intX - 1, intY + 1 ) === FLAG_E63
            ) return false;
        }else if( d === 8 ){
            if( undulationTypeW === FLAG_E63 ){
                if( !isSameVerticalTileW( - 1 ) ) return false;
            }else if( getUndulationType( intX - 1, intY - 1 ) === FLAG_E63 ){
                return false;
            }
        }
    }


    // FLAG_W45
    if( undulationType === FLAG_W45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
            }else if( d === 2 ){
                if( !isSameVerticalTile( 1 ) || !isSameVerticalTile( -1 ) ) return false;
            }else if( ( d === 8 || d === 4 ) && isSameVerticalTile( -1 ) ) return true;
        }else if( isJustY ){
            if( d === 2 && isSameVerticalTile( 1 ) ) return  isSameVerticalTile( 2 );
        }else if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
    }else if( !isJustX && isJustY && d === 2 && getUndulationType( intX, intY + 1 ) === FLAG_W45 ){
         return false;
    }else if( !isJustX ){
        if( undulationTypeW === FLAG_W45 ){
            if( d === 8 ){
                if( !isJustY && isSameVerticalTileW( - 1 ) && !isSameVerticalTileW( - 2 ) ) return false;
            }else if( d === 2 && isJustY && !isSameVerticalTileW( - 1 ) ) return false;
        }
    }

    // FLAG_E45
    if( undulationType === FLAG_E45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && !isSameVerticalTile( -1 ) ) return false;
            }else if( d === 2 ){
                if( !isSameVerticalTile( 1 ) || !isSameVerticalTile( -1 ) ) return false;
            }else if( ( d === 8 ||  d === 6 ) && isSameVerticalTile( -1 ) ) return true;
        }else if( isJustY ){
            if( d === 2 ) return isSameVerticalTile( -1 ) && isSameVerticalTile( 1 );
        }else if( d === 8 && isSameVerticalTile( -1 ) ) return isSameVerticalTile( - 2 );
    }else if( d === 8 && !isJustX ){
        if( undulationTypeW === FLAG_E45 && !isSameVerticalTileW( - 1 ) ){
            if( isSameVerticalTileW( 1 ) ){
                if( !isJustY ) return false;
            }else{
                if(  isJustY ) return false;
            }
        }
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
        const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulationType !== -1 ){

            const ratioXY = isW ? FLAG2RATIO_W[ undulationType ] : FLAG2RATIO_E[ undulationType ];
            if( ratioXY && !( ( undulationType === FLAG_W63 && 0.5 < tileX ) || ( undulationType === FLAG_E63 && tileX < 0.5 ) ) ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }

    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulationType === -1 || ( preRealX * 2 ) !== Math.floor( preRealX * 2 ) ) return;

    const targetPos = isW ? FLAG2POS_W[ undulationType ] : FLAG2POS_E[ undulationType ];
    if( targetPos === undefined ) return;

    // 角度63の坂は半分だけ動かす
    if( undulationType === FLAG_W63 ){
        if( isW ){
            if( tileX === 0 ) return;
        } else {
            if( tileX === 0.5 ) return;
        }
    }else if( undulationType === FLAG_E63 ){
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
 FLAG2BUMP[ FLAG_BUMP1 ] = 8;
 FLAG2BUMP[ FLAG_BUMP2 ] = 16;
 FLAG2BUMP[ FLAG_BUMP3 ] = 24;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = ( this._realX + 0.5 ) % 1;
    const intX = Math.floor( this._realX + 0.5 );
    const intY = Math.floor( this._realY + 0.5 );
    const undulationTypeL = ( tileX === 0 )? getUndulationType( intX - 1, intY ) : -1;
    const undulationTypeR = getUndulationType( intX, intY );
    if( -1 === undulationTypeL && -1 === undulationTypeR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulationType 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getBump = ( undulationType )=>{
        if( undulationType === -1 ) return 0;
        const bump = FLAG2BUMP[ undulationType ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getBump( undulationTypeR );
    const dYL = getBump( undulationTypeL );
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

    if( FLAG2RATIO_W[ getUndulationType( targetX , this.y ) ] || FLAG2RATIO_W[ getUndulationType( targetX , $gameMap.roundY( this.y + 0.5 ) ) ]  ){
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

    const undulationType = getUndulationType( x, y );
    const isSameVerticalTile = ( dy )=>{
        return undulationType === getUndulationType( x, y + dy );
    };
    // 高低差判定がある場合は全方向通行可
    if( FLAG2BUMP[ undulationType ] ) return true;

    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulationType ] && isSameVerticalTile( 1 ) ) return true;

    return _Game_Map_isPassable.apply( this, arguments );
};



/*---- ユーティリティ関数 ----*/
/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulationType 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function getUndulationType( x, y ){
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
