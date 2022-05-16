import { Comprops, CrudCompW, invalidStyles } from "@anclient/anreact";
import { withStyles, withWidth } from "@material-ui/core";
import React from "react";
import Gallery from "react-photo-gallery";
import { StarTheme } from "../../common/star-theme";
import SelectedImage from "./photo-view";

const photos = [
  { src: "https://source.unsplash.com/2ShvY8Lf6l0/800x599",
    width: 4,
    height: 3,
    title: 'Blaaaaaaa'
  },
  { src: "https://source.unsplash.com/Dm-qxdynoEc/800x799",
    width: 1,
    height: 1
  },
  { src: "https://source.unsplash.com/qDkso9nvCg0/600x799",
    width: 3,
    height: 4,
    title: 'manyyyy444yyyyyyyyyyyyyyyyyyyyyy2222222222yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy111'
  },
  { src: "https://source.unsplash.com/iecJiKe_RNg/600x799",
    width: 3,
    height: 4
  },
  { src: "https://source.unsplash.com/epcsn8Ed8kY/600x799",
    width: 3,
    height: 4
  },
  { src: "https://source.unsplash.com/NQSWvyVRIJk/800x599",
    width: 4,
    height: 3
  },
  { src: "https://source.unsplash.com/zh7GEuORbUw/600x799",
    width: 3,
    height: 4
  },
  { src: "https://source.unsplash.com/PpOHJezOalU/800x599",
    width: 4,
    height: 3
  },
  { src: "https://source.unsplash.com/I1ASdgphUH4/800x599",
    width: 4,
    height: 3
  }
];

const styles = (theme: StarTheme) => (Object.assign(
	invalidStyles, {
        root: {}
    }
));

interface GalleryProps extends Comprops {

};

class PhotoGalleryComp extends CrudCompW<GalleryProps> {
    selectAll = false;
  
    toggleSelectAll = () => {
      this.selectAll = !this.selectAll;
    };
  
    imageRenderer = ({ index, left, top, photo }: { index: number, left?: number, top?: number, photo: any}) =>
    ( <SelectedImage
        selected={this.selectAll ? true : false}
        margin={"2px"}
        index={index}
        photo={photo}
        left={left}
        top={top} direction={undefined}
    /> );
  
    render() {
      const { classes } = this.props;
      return (
        <div className={classes.root} >
            <p><button onClick={this.toggleSelectAll}>toggle select all</button></p>
            <Gallery photos={photos} renderImage={this.imageRenderer} />
        </div>
      );
    }
}

const PhotoGallery = withStyles<any, any, GalleryProps>(styles)(withWidth()(PhotoGalleryComp));
export { PhotoGallery, PhotoGalleryComp }