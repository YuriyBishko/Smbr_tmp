<!DOCTYPE html>
<html ng-app="appMain">
<?php

/**
 * index.php
 * Template for the page that displays all of your posts.
 */

get_header(); ?>

  <?php

    $weeknd_s = get_field('weekend-lght');
                 if ($weeknd_s=="weeknd-icon") {
                    $weekend_style ="weekend_style";
                    $weekend_clear = "weekend_clear";
                    $weekend_post = 3;
                  }
                  else{
                    $weekend_post = 4;
                  }

    $args = array(
                  'post_status' => 'publish',
                  'posts_per_page' => 1,
                  'category_name' => 'week',
                  'post__in' => get_option('sticky_posts'),
                  'post__not_in' => array($post->ID)
                );
    $args_wknd = array(
                  'post_status' => 'publish',
                  'posts_per_page' => $weekend_post,
                  'category_name' => 'week',
                  'post__not_in' => get_option('sticky_posts'),
                  'post__not_in' => array($post->ID)
                );

    $args_bg_crd = array(
                  'post_status' => 'publish',
                  'posts_per_page' => 1,
                  'meta_key' => 'primary_card',
                  'meta_value' => true,
                  'post__not_in' => array($post->ID)
                );

    $args_sm_crd=array(
                  'post_status' => 'publish',
                  'posts_per_page' => 7,
                  'cat' => -8,
                  'post__not_in' => array($post->ID)
                );


    $context = Timber::get_context();
    $context['weekends_sticky'] = Timber::get_posts($args);
    $context['weekends'] = Timber::get_posts($args_wknd);
 
  ?>

    <script type="text/javascript">
      onResize = function() {
        var weekend_post_ch = <?php echo $weekend_post; ?>;

        if ((weekend_post_ch==3) && (jQuery(window).width() < 1000 )) {

            jQuery("#desktop_weekend").hide();
            jQuery("#desktop_news").hide();
            jQuery("#mobile_weekend").show();
          }
          else if ((weekend_post_ch==3) && (jQuery(window).width() > 1000 ))  {
            jQuery("#mobile_weekend").hide();
            jQuery("#desktop_news").hide();
            jQuery("#desktop_weekend").show();

          }
          else if ((weekend_post_ch==4) && (jQuery(window).width() < 1000 ) && (jQuery(window).width() > 568 ))  {
            jQuery("#mobile_weekend").hide();
            jQuery("#desktop_weekend").hide();
            jQuery("#desktop_news").show();
          }
          else if ((weekend_post_ch==4) && (jQuery(window).width() < 567 ))  {
            jQuery("#mobile_weekend").hide();
            jQuery("#desktop_news").hide();
            jQuery("#desktop_weekend").show();
          }
          else if ((weekend_post_ch==4) && (jQuery(window).width() > 1000 ))  {
            jQuery("#mobile_weekend").hide();
            jQuery("#desktop_news").hide();
            jQuery("#desktop_weekend").show();
          }

      };
      jQuery(document).ready(onResize);
      jQuery(window).resize(onResize);
    </script>

  <!-- FIRST SCREEN -->
  <!-- home adv
    <dir ng-controller="mainAdv" class="main-adv" ng-show="widget">
      <div ng-bind-html="renderHtml(widget)" ></div>
    </dir>
    END -->
    <section id="desktop_weekend" class="section main__news" >
      <div class="container card_clear">
        <?php
             Timber::render('weekend_cover.twig',$context);
        ?>
      </div>
    </section>
  <!-- / FIRST SCREEN -->

  <!-- DESKTOP SCREEN -->
    <section id="desktop_news" class="section main__news" >
      <div class="container card_clear">
        <?php  Timber::render('weekend_news.twig',$context);   ?>
      </div>
    </section>
  <!-- / DESKTOP SCREEN -->

  <!-- FIRST MOBILESCREEN -->
    <section id="mobile_weekend" class="section main__news" >
      <div class="container card_clear">
        <?php  Timber::render('weekend_mobile.twig',$context);   ?>
      </div>
    </section>
    <script>
      $( "article.magic_flash:nth-child( 2 )" ).css( {"margin-right": "0", "margin-top": "220px"} );
    </script>
  <!-- / FIRST MOBILE SCREEN -->

  <!-- NEWS GRID -->
  <section class="section news_grid card_clr">
    <div class="container">

          <?php
              $context['post_bg'] = Timber::get_posts($args_bg_crd);
              $exclude_bg_crd = $context['post_bg'][0]->ID;

              Timber::render('primary_card_bg.twig',$context);     

              $context['post_sm'] = Timber::get_posts($args_sm_crd);
              Timber::render('primary_card_sm.twig',$context); 
              Timber::render('primary_card_sm_clr.twig',$context);     
          ?>

    <maichimp-subscribe></maichimp-subscribe
    </div>
  </section>
  <!-- / NEWS GRID -->

  <!-- СПЕЦПРОЕКТ -->
  <?php $specialProject = do_shortcode('[contentblock id=special-project]'); ?>
  <?php if( $specialProject ): ?>
      <?php echo $specialProject; ?>
  <?php endif; ?>
  <!-- / СПЕЦПРОЕКТ -->

  <!-- СБОРЩИК -->
  <?php include(locate_template('views/agrigator.php')); ?>
  <!-- / СБОРЩИК -->

  <!-- NEWS GRID -->

  <section class="section news_grid">
    <div class="container">

      <?php $more = do_shortcode('[ajax_load_more post_type="post" post__not_in="'.$exclude_bg_crd.'" repeater="1-default" preloaded="true" preloaded_amount="12" offset="7" category__not_in="8,2" scroll_distance="300" posts_per_page="12" transition_container="none" button_label="Загрузить ещё" button_loading_label="Загружаем…" container_type="div" css_classes="infinite-scroll"]'); ?>
      <?php if( $more ): 
          echo $more;
        endif; 
      ?>

     </div>
  </section>
  <!-- / NEWS GRID -->


<?php get_footer(); ?>


<script type="text/javascript">
$(document).ready(function() {
  $('.site__header').removeClass('dark');
  $( ".story__card.clear" )
    .mouseenter(function() {
      $( this ).find( ".story__author" ).css( "color","black" );
    })
    .mouseleave(function() {
        $( this ).find( ".story__author" ).css( "color","white" );
    });
  $(document).on('scroll', function() {

    if ($(document).height() == $(document).scrollTop()+$(window).height())
    $('#load-more').click()
  })
});
</script>